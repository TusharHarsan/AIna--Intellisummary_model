export const timeToSecs = timecode => {
  const split = timecode.split(':').map(parseFloat)

  return split.length === 2
    ? split[0] * 60 + split[1]
    : split[0] * 3600 + split[1] * 60 + split[2]
}
