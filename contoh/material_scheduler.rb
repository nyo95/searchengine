require 'sketchup.rb'
require 'extensions.rb'

module MSched
  VERSION = '0.4.1' unless defined?(MSched::VERSION)
end

ext = SketchupExtension.new('Material Scheduler', 'material_scheduler/init')
ext.version     = MSched::VERSION
ext.creator     = 'Material Scheduler'
ext.description = 'Material Scheduler v' + MSched::VERSION + ' — Quick Edit, normalization, modern UI.'
Sketchup.register_extension(ext, true)
