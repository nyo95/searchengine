module MSched
  module TmpCleaner
    # Delete swatch PNGs that are stale or no longer associated with materials.
    # - days_old: files older than this age are removed
    def self.cleanup_swatches(days_old: 7)
      dir = File.join(MSched::ROOT, 'ui', 'tmp')
      return unless File.exist?(dir)
      begin
        threshold = Time.now - (days_old.to_i * 24 * 60 * 60)
        # Build a set of current material IDs to keep related swatches
        ids = {}
        begin
          Sketchup.active_model.materials.each { |m| ids[m.persistent_id] = true }
        rescue
        end

        Dir.glob(File.join(dir, 'mat_*.png')).each do |path|
          name = File.basename(path)
          pid = nil
          if name =~ /^mat_(\d+)\.png$/
            pid = $1.to_i
          end
          mtime = begin; File.mtime(path); rescue; Time.at(0); end
          # Remove if orphaned (no matching material) or too old
          if pid.nil? || !ids[pid] || mtime < threshold
            begin
              File.delete(path)
            rescue
            end
          end
        end
      rescue => e
        begin
          MSched::Logger.warn(:tmp_clean_fail, message: e.message)
        rescue
        end
      end
    end
  end
end

