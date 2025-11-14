module MSched
  module SyncService
    @timer=nil; @selection_obs=nil; @materials_obs=nil; @debounce_sec=0.25
    @sw_cache = {}
    @sw_refresh_until = Time.at(0)

    def self.start
      attach_selection_listener
    end

    def self.debounce(&blk)
      UI.stop_timer(@timer) if @timer
      @timer = UI.start_timer(@debounce_sec, false){ blk.call }
    end

    def self.attach_selection_listener
      return if @selection_obs
      # Selection observer (entities picked in model)
      @selection_obs = Class.new do
        define_method(:onSelectionBulkChange){ |sel| MSched::SyncService.selection_changed(sel) }
        define_method(:onSelectionCleared){ |sel| MSched::SyncService.selection_changed(sel) }
        define_method(:onSelectionAdded){ |sel,_| MSched::SyncService.selection_changed(sel) }
        define_method(:onSelectionRemoved){ |sel,_| MSched::SyncService.selection_changed(sel) }
      end.new
      Sketchup.active_model.selection.add_observer(@selection_obs)

      # Materials palette observer (color picker current material)
      return if @materials_obs
      @materials_obs = Class.new(Sketchup::MaterialsObserver) do
        define_method(:onMaterialSetCurrent){ |materials, material| MSched::SyncService.material_selected(material) }
        define_method(:onMaterialChange){ |materials, material|
          # Only update Quick selection snapshot; other tabs stay cached until Refresh
          begin
            cur = materials.current
            if material && cur && material.persistent_id == cur.persistent_id
              MSched::SyncService.material_selected(material)
            end
          rescue
          end
        }
      end.new
      Sketchup.active_model.materials.add_observer(@materials_obs)
    end

    # Allow swatch refresh within a short window (e.g., when dialog opens or user clicks Refresh)
    def self.allow_swatch_refresh_window(seconds = 3)
      begin
        @sw_refresh_until = Time.now + seconds.to_f
      rescue
      end
    end

    def self.stop
      # Detach observers to avoid duplicates when reloading
      begin
        if @selection_obs
          Sketchup.active_model.selection.remove_observer(@selection_obs)
          @selection_obs = nil
        end
      rescue; end
      begin
        if @materials_obs
          Sketchup.active_model.materials.remove_observer(@materials_obs)
          @materials_obs = nil
        end
      rescue; end
      UI.stop_timer(@timer) if @timer
      @timer = nil
    end

    def self.material_selected(mat)
      return unless mat
      meta = MetadataStore.read_meta(mat)
      code = meta['code']
      begin; code ||= MSched::RulesEngine.canonical(mat.display_name); rescue; end
      # Only reflect explicit metadata for type; do not infer from name/code
      type = meta['type']
      sw = swatch_for(mat)
      payload = {
        id: mat.persistent_id,
        name: mat.display_name,
        code: code,
        type: type,
        number: (code && code.split('-')[1]&.to_i),
        brand: meta['brand'],
        notes: meta['notes'],
        subtype: meta['subtype'],
        sample: !!meta['sample'],
        hidden: !!meta['hidden'],
        locked: !!meta['locked'],
        swatch: sw
      }
      MSched::EventBus.publish(:selected_material_info, payload)
    end

    def self.selection_changed(sel)
      debounce do
        mat = nil
        sel.each do |ent|
          if ent.respond_to?(:material) && ent.material
            mat = ent.material
            break
          end
        end
        if mat
          meta = MetadataStore.read_meta(mat)
          code = meta['code']
          begin; code ||= MSched::RulesEngine.canonical(mat.display_name); rescue; end
          # Only reflect explicit metadata for type; do not infer from name/code
          type = meta['type']
          sw = swatch_for(mat)
          payload = {
            id: mat.persistent_id,
            name: mat.display_name,
            code: code,
            type: type,
            number: (code && code.split('-')[1]&.to_i),
            brand: meta['brand'],
            notes: meta['notes'],
            subtype: meta['subtype'],
            sample: !!meta['sample'],
            hidden: !!meta['hidden'],
            locked: !!meta['locked'],
            swatch: sw
          }
          MSched::EventBus.publish(:selected_material_info, payload)
        else
          MSched::EventBus.publish(:selected_material_info, nil)
        end
      end
    end

    def self.swatch_for(mat)
      begin
        if mat.texture
          dir = File.join(MSched::ROOT, 'ui', 'tmp')
          Dir.mkdir(dir) unless File.exist?(dir)
          path = File.join(dir, "mat_#{mat.persistent_id}.png")
          allow = begin; Time.now <= (@sw_refresh_until || Time.at(0)); rescue; false; end
          if File.exist?(path)
            # Refresh only during the allowed window to reduce IO
            if allow
              begin; mat.texture.write(path); rescue; end
            end
          else
            # Always create if missing to avoid blank swatches
            begin; mat.texture.write(path); rescue; end
          end
          stamp = begin; File.mtime(path).to_i; rescue; Time.now.to_i; end
          return { kind: 'texture', path: path, stamp: stamp }
        else
          c = mat.color
          return { kind: 'color', rgba: [c.red, c.green, c.blue, (c.alpha || 255)], stamp: Time.now.to_i }
        end
      rescue
        return nil
      end
    end
  end
end
