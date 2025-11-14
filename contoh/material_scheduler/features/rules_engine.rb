module MSched
  module RulesEngine
    def self.canonical(code)
      return nil unless code.is_a?(String) && code.include?('-')
      pref,num=code.split('-',2)
      # Izinkan prefix 1 huruf atau lebih (contoh: "F")
      return nil unless pref =~ /^[A-Z]{1,}$/ && num =~ /^\d+$/
      '%s-%d' % [pref, num.to_i]
    end
    def self.make_code(prefix, number)
      # Izinkan prefix 1 huruf atau lebih (contoh: "F")
      return nil unless prefix =~ /^[A-Z]{1,}$/ && number.to_i>0
      '%s-%d' % [prefix, number.to_i]
    end
    def self.number_of(code)
      c = canonical(code); return nil unless c
      c.split('-',2)[1].to_i
    end
  end
end
