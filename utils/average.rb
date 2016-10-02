require 'matrix'
require 'json'

samples = {
  src: %w(
  ),
  des: %w(
  )
}

offset = Vector[
  0.0,
  0.0,
  0.0,
  0.0,
  0.0,
  0.0,
  0.0,
  0.0,
  0.0,
  0.0,
  0.0,
  0.0,
  0.0,
  0.0,
  0.0,
  0.0
]

averages = %i(src des).map do |key|
  lists = samples[key].map do |hex|
    hex.scan(/.{2}/).map(&:hex)
  end
  lists.transpose.map do |a|
    a.inject(&:+).to_f / a.size
  end
end
averages.each.with_index do |avg, i|
  puts format('%d: %s', i, avg.map { |e| format('%02x', e) }.join)
end
diff = Vector[*averages[1]] - Vector[*averages[0]]
puts((offset + diff.map { |e| e / 127.5 }).to_a.to_json)
