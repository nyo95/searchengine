require 'json'
module MSched
  module DialogRPC
    @dlg = nil
    @handlers = {}
    @push_timer = nil
    @push_pending = false

    def self.dialog
      return @dlg if @dlg && @dlg.visible?
      @dlg ||= begin
        d = UI::HtmlDialog.new(
          dialog_title: 'Material Scheduler v' + MSched::VERSION,
          preferences_key: 'material_scheduler_ui',
          width: 1120, height: 720, resizable: true, scrollable: true
        )
        # Roll back to stable classic UI while Tailwind redesign is completed
        d.set_file(File.join(MSched::ROOT, 'ui', 'dialog.html'))
        d.set_on_closed { @dlg = nil }

        d.add_action_callback('rpc') do |_ctx, payload|
          begin
            data = JSON.parse(payload.to_s) rescue {}
            name = data['name']
            args = data['args'] || {}
            MSched::Logger.info(:rpc_in, name: name, args: args)
            raise 'Unknown RPC: ' + name.to_s unless @handlers[name]
            res = @handlers[name].call(args)
            d.execute_script('window.__ms_rpc_resolve(' + { name: name, result: res }.to_json + ')')
          rescue => e
            MSched::Logger.error(:rpc_error, message: e.message, backtrace: (e.backtrace || [])[0, 2])
            d.execute_script('window.__ms_rpc_reject(' + { name: name, error: e.message }.to_json + ')')
          end
        end

        d.add_action_callback('ready') { |_ctx, _| MSched::Logger.info(:ui_ready); begin; MSched::SyncService.allow_swatch_refresh_window(3); rescue; end; MSched::DialogRPC.schedule_push_full }
        d.add_action_callback('refresh') { |_ctx, _| MSched::Logger.info(:compat_refresh); begin; MSched::SyncService.allow_swatch_refresh_window(3); rescue; end; MSched::DialogRPC.schedule_push_full }
        d.add_action_callback('export_csv') do |_ctx, _|
          begin
            rows = MSched::MetadataStore.entries
            cols = %w[code brand type notes locked sample hidden name kind_label]
            path = UI.savepanel('Export CSV', Dir.pwd, 'materials.csv')
            if path
              require 'csv'
              File.write(path, MSched::CSVExporter.export(rows, cols))
              UI.messagebox('Exported.')
            end
          rescue => e
            MSched::Logger.error(:export_fail, message: e.message)
          end
        end
        d.add_action_callback('apply_change') { |_ctx, payload| MSched::DialogRPC.__compat_apply_change(payload) }
        d.add_action_callback('save_types') { |_ctx, payload| MSched::DialogRPC.__compat_save_types(payload) }
        d.add_action_callback('ping') { |_ctx, arg| MSched::Logger.info(:ui_ping, arg: arg); begin; @dlg && @dlg.execute_script("window.__setStatus && __setStatus('Bridge OK')"); rescue; end }

        UI.start_timer(0.1, false) { begin; MSched::SyncService.allow_swatch_refresh_window(3); rescue; end; schedule_push_full }
        d
      end
    end

    def self.show
      dialog.show
    end

    def self.close
      begin
        @dlg.close if @dlg
      rescue
      ensure
        @dlg = nil
      end
    end

    def self.on(name, &blk)
      @handlers[name] = blk
    end

    def self.push_full
      data = {
        entries: MSched::MetadataStore.entries(include_hidden: true, used_only: false),
        kinds: MSched::KindsStore.list,
        logs: MSched::Logger.tail(50),
        selected: @last_selected || nil
      }
      @dlg && @dlg.execute_script('window.__ms_receive_full(' + data.to_json + ')')
    end

    def self.schedule_push_full(delay: 0.15)
      @push_pending = true
      begin
        UI.stop_timer(@push_timer) if @push_timer
      rescue
      end
      @push_timer = UI.start_timer(delay, false) do
        @push_pending = false
        begin
          push_full
        rescue => e
          MSched::Logger.warn(:push_full_error, message: e.message)
        end
      end
    end

    def self.update_selected(payload)
      @last_selected = payload
      @dlg && @dlg.execute_script('window.__ms_selected_info(' + payload.to_json + ')')
    end
  end
end

MSched::EventBus.subscribe(:data_changed) { |_p| MSched::DialogRPC.schedule_push_full }
MSched::EventBus.subscribe(:selected_material_info) { |p| MSched::DialogRPC.update_selected(p) if p }

module MSched
  # Selaraskan get_full dengan push_full agar tampilan konsisten
  DialogRPC.on('get_full') { |_a| { entries: MetadataStore.entries(include_hidden: true, used_only: false), kinds: KindsStore.list } }
  # Allow a brief swatch refresh window on explicit refresh calls
  old_get_full = DialogRPC.instance_variable_get(:@handlers)['get_full'] rescue nil
  if old_get_full
    DialogRPC.on('get_full') do |_a|
      begin; MSched::SyncService.allow_swatch_refresh_window(3); rescue; end
      old_get_full.call(nil)
    end
  end

  DialogRPC.on('quick_apply') do |a|
    id = a['id'].to_i
    prefix_present = a.key?('prefix')
    prefix = prefix_present ? (a['prefix'] || '').to_s.upcase.strip : ''
    number = (a['number'] || '').to_s.strip
    brand_present = a.key?('brand')
    brand = brand_present ? (a['brand'] || '').to_s.strip.gsub(/\s+/, ' ') : nil
    notes_present = a.key?('notes')
    notes = notes_present ? (a['notes'] || '').to_s.strip.gsub(/\s+/, ' ') : nil
    subtype_present = a.key?('subtype')
    subtype = subtype_present ? (a['subtype'] || '').to_s.strip.gsub(/\s+/, ' ') : nil
    upd = nil
    Undo.wrap('Quick Apply') do
      m = MetadataStore.find_material(id); raise 'NOT_FOUND' unless m
      meta = MetadataStore.read_meta(m)

      if meta['locked']
        # Locked: block quick edit changes
        raise 'LOCKED_EDIT_DENIED'
      else
        # Unlocked: type/code allocation and metadata updates
        if prefix_present
          if prefix && prefix != ''
            MetadataStore.write_meta(m, { 'type' => prefix })
          else
            MetadataStore.write_meta(m, { 'type' => nil })
          end
        end
        prev_code = meta['code']
        prev_pref = prev_code ? prev_code.split('-',2)[0] : (meta['type'] || nil)
        eff_pref = if prefix_present && prefix != ''
          prefix
        else
          meta['type'] || nil
        end
        if eff_pref && eff_pref != ''
          desired = if (prefix && !prefix.empty? && prev_pref && prev_pref != eff_pref)
            1
          else
            (number.to_i > 0 ? number.to_i : (RulesEngine.number_of(meta['code']) || 1))
          end
          CodeAllocator.allocate_from_number(m, eff_pref, desired)
        end
        meta_updates = {}
        meta_updates['brand'] = brand if brand_present
        meta_updates['notes'] = notes if notes_present
        meta_updates['subtype'] = subtype if subtype_present
        MetadataStore.write_meta(m, meta_updates) unless meta_updates.empty?
      end
      # Build updated snapshot to return
      latest = MetadataStore.read_meta(m)
      sw = nil; begin; sw = MSched::SyncService.swatch_for(m); rescue; end
      upd = {
        id: m.persistent_id,
        name: m.display_name,
        code: latest['code'],
        type: latest['type'],
        number: (latest['code'] && latest['code'].split('-')[1]&.to_i),
        brand: latest['brand'],
        notes: latest['notes'],
        subtype: latest['subtype'],
        sample: !!latest['sample'],
        hidden: !!latest['hidden'],
        locked: !!latest['locked'],
        swatch: sw
      }
    end
    EventBus.publish(:data_changed, {}); { ok: true, updated: upd }
  end

  DialogRPC.on('normalize_all') { |_a| CodeAllocator.normalize_all }

  DialogRPC.on('set_flags') do |a|
    ids = Array(a['ids']).map(&:to_i)
    flags = a['flags'] || {}
    # Remove deprecated keys
    flags.delete('sample_notes') if flags.key?('sample_notes')
    # Normalize alias keys from UI
    if flags.key?('received') && !flags.key?('sample_received')
      flags['sample_received'] = flags.delete('received')
    end
    changed = []
    Undo.wrap('Set Flags') do
      ids.each do |pid|
        m = MetadataStore.find_material(pid); next unless m
        meta = MetadataStore.read_meta(m)
        # When locked: allow toggling 'locked' itself, 'sample' and 'sample_received'; block others
        if meta['locked'] && (flags.keys - ['locked','sample','sample_received']).any?
          next
        end
        MetadataStore.write_meta(m, meta.merge(flags)); changed << pid
      end
    end
    EventBus.publish(:data_changed, {}); { ok: true, ids: changed }
  end

  DialogRPC.on('swap_codes') do |a|
    ida = a['a'].to_i; idb = a['b'].to_i
    m1 = MetadataStore.find_material(ida); m2 = MetadataStore.find_material(idb)
    raise 'NOT_FOUND' unless m1 && m2
    meta1 = MetadataStore.read_meta(m1); meta2 = MetadataStore.read_meta(m2)
    # Disallow when locked / hidden
    raise 'LOCKED_SWAP_DENIED' if meta1['locked'] || meta2['locked']
    raise 'HIDDEN_SWAP_DENIED' if meta1['hidden'] || meta2['hidden']
    c1 = meta1['code'] || (RulesEngine.canonical(m1.display_name) rescue nil)
    c2 = meta2['code'] || (RulesEngine.canonical(m2.display_name) rescue nil)
    raise 'MISSING_CODE' unless c1 && c2
    t1 = c1.split('-',2)[0]; t2 = c2.split('-',2)[0]
    # Enforce same prefix/type
    raise 'TYPE_MISMATCH' unless t1 == t2
    # Full swap: exchange codes AND metadata (brand, notes, subtype, flags, etc.)
    MSched::Logger.info(:swap_begin, a: ida, b: idb, a_meta: meta1, b_meta: meta2, a_name: m1.display_name, b_name: m2.display_name)
    # while renaming safely using a temporary name to avoid collisions.
    Undo.wrap('Swap Codes') do
      tmp = "__swap_#{Time.now.to_i}_#{rand(100000)}"
      # Prepare metadata maps ensuring keys missing on one side are explicitly cleared on the other
      m1_meta_base = (meta1 || {}).dup
      m2_meta_base = (meta2 || {}).dup
      keys = (m1_meta_base.keys + m2_meta_base.keys).uniq - ['code','type']
      # Build payloads that include explicit nils to clear stale values when merging
      m1_clean = {}; m2_clean = {}
      keys.each { |k| m1_clean[k] = m1_meta_base[k]; m2_clean[k] = m2_meta_base[k] }

      # Move m1 away to avoid name collision
      m1.name = tmp
      MetadataStore.write_meta(m1, meta1.merge({ 'code'=>nil }))

      # Assign m1's metadata (w/ code/type from c1) to m2
      m2.name = c1
      MetadataStore.write_meta(m2, m2_clean.merge(m1_clean).merge({ 'code'=>c1, 'type'=>t1 }))

      # Assign m2's metadata (w/ code/type from c2) to m1
      m1.name = c2
      MetadataStore.write_meta(m1, m1_clean.merge(m2_clean).merge({ 'code'=>c2, 'type'=>t2 }))
    end
    # Post-swap snapshot
    begin
      m1_after = MetadataStore.read_meta(m1); m2_after = MetadataStore.read_meta(m2)
      MSched::Logger.info(:swap_done, a: ida, b: idb, a_meta: m1_after, b_meta: m2_after, a_name: m1.display_name, b_name: m2.display_name)
    rescue => e
      MSched::Logger.warn(:swap_postlog_error, message: e.message)
    end
    EventBus.publish(:data_changed, {}); { ok: true }
  end

  DialogRPC.on('delete_material') do |a|
    id = a['id'].to_i
    Undo.wrap('Delete Material') do
      m = MetadataStore.find_material(id); raise 'NOT_FOUND' unless m
      meta = MetadataStore.read_meta(m); raise 'LOCKED_EDIT_DENIED' if meta['locked']
      MetadataStore.delete_meta(m); Sketchup.active_model.materials.remove(m)
    end
    EventBus.publish(:data_changed, {}); { ok: true }
  end

  DialogRPC.on('kinds_save') { |a| KindsStore.save(a['kinds'] || {}); { ok: true } }
  DialogRPC.on('export_csv') do |a|
    cols = a['cols'] || []
    # Export only materials that appear in Scheduler (typed and not hidden)
    rows = MetadataStore.entries(include_hidden: true, used_only: false)
    rows = rows.select { |r| (r[:type] && r[:type].to_s.strip != '') && !r[:hidden] }
    csv = CSVExporter.export(rows, cols)
    { csv: csv }
  end
  DialogRPC.on('normalize_preview') { |_a| MSched::CodeAllocator.normalize_preview }

  DialogRPC.on('purge_unused_materials') do |_a|
    used = MetadataStore.used_material_ids
    removed = []
    MSched::Undo.wrap('Purge Unused Materials') do
      Sketchup.active_model.materials.each do |m|
        next if used.include?(m.persistent_id)
        Sketchup.active_model.materials.remove(m)
        removed << m.display_name rescue nil
      end
    end
    EventBus.publish(:data_changed, {})
    { ok: true, removed_count: removed.size }
  end

  # Generate 2D boards in the model for materials visible in Scheduler
  # - Grouped per type, sorted by code/number
  # - Only materials with explicit code and not hidden
  # - Creates a single top-level group named "MSched Boards" (replaced on each run)
  DialogRPC.on('generate_boards') do |a|
    size_mm = (a['size'] || 500).to_f
    gap_mm  = (a['gap']  || 100).to_f
    size = size_mm.mm
    gap  = gap_mm.mm

    rows = MetadataStore.entries(include_hidden: true, used_only: false)
    rows = rows.select { |r| (r[:type] && r[:type].to_s.strip != '') && !r[:hidden] && r[:code] }

    # Group by type then sort groups by type label
    groups = rows.group_by { |r| r[:type] }
    groups = groups.sort_by { |type, _arr| type.to_s }

    count = 0
    model = Sketchup.active_model
    ents  = model.entities

    MSched::Undo.wrap('Generate Boards') do
      # Remove previous boards group(s)
      begin
        ents.grep(Sketchup::Group).select { |g| g.name == 'MSched Boards' }.each { |g| g.erase! }
      rescue
      end

      group = ents.add_group
      group.name = 'MSched Boards'
      gents = group.entities

      margin = 40.mm
      code_h = 70.mm
      kind_h = 60.mm

      y_idx = 0
      groups.each do |_type, arr|
        # Sort by number within the same type, fallback to code string
        sorted = arr.sort_by { |r| [ (MSched::RulesEngine.number_of(r[:code]) || 0), r[:code].to_s ] }
        x_idx = 0
        sorted.each do |r|
          mat = MetadataStore.find_material(r[:id].to_i)
          next unless mat && mat.valid?

          # Per-board group so geometry and labels are self-contained
          tileg = gents.add_group
          tileg.name = (r[:code] || r[:name] || 'MSched Tile').to_s
          t = tileg.entities

          # Compute grid position, but build geometry at tile-local origin
          x = x_idx * (size + gap)
          y = y_idx * (size + gap)
          # Plane in its own subgroup so tile contains [plane, label]
          planeg = t.add_group
          planeg.name = 'plane'
          pents = planeg.entities
          p1 = Geom::Point3d.new(0,    0,    0)
          p2 = Geom::Point3d.new(size, 0,    0)
          p3 = Geom::Point3d.new(size, size, 0)
          p4 = Geom::Point3d.new(0,    size, 0)
          face = pents.add_face(p1, p2, p3, p4)
          begin
            face.material = mat
            face.back_material = mat
          rescue
          end

          # Compute centers in tile-local coordinates
          cx_local = size / 2.0
          cy_local = size / 2.0

          # Helper to add centered text into tile group
          add_text = lambda do |str, height, yval|
            return nil unless str && str.to_s.strip != ''
            g = nil
            begin
              g = t.add_3d_text(str.to_s, TextAlignCenter, 'Arial', true, false, height, 1.mm, 1.mm, true, 0.0)
            rescue
              g = nil
            end
            if g
              begin
                c = g.bounds.center
                pt_local = Geom::Point3d.new(cx_local, yval, 1.mm)
                g.transform!(Geom::Transformation.translation(pt_local - c))
                begin; g.material = Sketchup::Color.new(0,0,0); rescue; end
                begin; g.name = 'code_label'; rescue; end
              rescue
              end
            end
            g
          end

          # Baris 1: code (top) and Baris 7: kind_label (bottom)
          add_text.call(r[:code].to_s, code_h, cy_local)

          # Move the whole tile group to its grid position
          begin
            tileg.transform!(Geom::Transformation.translation(Geom::Vector3d.new(x, y, 0)))
          rescue
          end

          x_idx += 1
          count += 1
        end
        y_idx += 1
      end
    end

    { ok: true, count: count }
  end

  def self.__compat_apply_change(payload)
    data  = JSON.parse(payload.to_s) rescue {}
    id    = (data['id'] || data[:id]).to_i
    field =  data['field'] || data[:field]
    val   = data['value']
    m = MSched::MetadataStore.find_material(id); return { ok: false } unless m
    meta = MSched::MetadataStore.read_meta(m) || {}
    case field
    when 'type'
      kinds = MSched::KindsStore.list
      px = kinds.key(val) || val.to_s.upcase
      MSched::Undo.wrap('Set Type') { MSched::MetadataStore.write_meta(m, meta.merge({ 'type' => px })) }
      if !meta['code'] && px && !px.empty?
        MSched::CodeAllocator.allocate_from_number(m, px, 1)
      end
      MSched::EventBus.publish(:data_changed, {})
      { ok: true }
    when 'code'
      norm = (MSched::RulesEngine.canonical(val) rescue nil)
      if norm
        px = norm.split('-', 2)[0]
        num = norm.split('-', 2)[1].to_i
        MSched::Undo.wrap('Set Code') { MSched::CodeAllocator.allocate_from_number(m, px, num) }
        MSched::EventBus.publish(:data_changed, {})
        { ok: true }
      else
        { ok: false }
      end
    when 'brand','subtype','notes','locked','sample','sample_received','hidden'
      if field == 'brand' || field == 'notes'
        val = (val || '').to_s.strip.gsub(/\s+/, ' ')
      end
      MSched::Undo.wrap('Set Meta') { MSched::MetadataStore.write_meta(m, meta.merge({ field => val })) }
      MSched::EventBus.publish(:data_changed, {}); { ok: true }
    when 'hide'
      MSched::Undo.wrap('Hide') { MSched::MetadataStore.write_meta(m, meta.merge({ 'hidden' => true })) }
      MSched::EventBus.publish(:data_changed, {}); { ok: true }
    when 'unhide'
      MSched::Undo.wrap('Unhide') { MSched::MetadataStore.write_meta(m, meta.merge({ 'hidden' => false })) }
      MSched::EventBus.publish(:data_changed, {}); { ok: true }
    when 'delete'
      MSched::Undo.wrap('Delete') { MSched::MetadataStore.delete_meta(m); Sketchup.active_model.materials.remove(m) }
      MSched::EventBus.publish(:data_changed, {}); { ok: true }
    else
      { ok: false }
    end
  end

  def self.__compat_save_types(payload)
    arr = JSON.parse(payload.to_s) rescue []
    kinds = {}
    if arr.is_a?(Array)
      arr.each do |h|
        px = (h['prefix'] || h[:prefix]).to_s.upcase.strip
        lb = (h['type'] || h[:type] || '').to_s
        next if px.empty?
        kinds[px] = lb
      end
    end
    MSched::KindsStore.save(kinds)
    MSched::DialogRPC.push_full
    { ok: true }
  end
end

