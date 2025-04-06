export default {
  'Captions': {
    emoji: '👀',
    prompt: `For each scene in this video, generate captions that describe the \
    scene along with any spoken text placed in quotation marks. Place each \
    caption into an object sent to set_timecodes with the timecode of the caption \
    in the video.`,
    isList: true
  },

  Paragraph: {
    emoji: '📝',
    prompt: `Generate a paragraph that summarizes this video. Keep it to 3 to 5 \
sentences. Place each sentence of the summary into an object sent to \
set_timecodes with the timecode of the sentence in the video.`
  },

  'Key moments': {
    emoji: '🔑',
    prompt: `Generate bullet points for the video. Place each bullet point into an \
object sent to set_timecodes with the timecode of the bullet point in the video.`,
    isList: true
  },

  Table: {
    emoji: '🤓',
    prompt: `Choose 5 key shots from this video and call set_timecodes_with_objects \
with the timecode, text description of 10 words or less, and a list of objects \
visible in the scene (with representative emojis).`
  },
Chart: {
    emoji: '📈',
    prompt: input =>
      `Generate chart data for this video based on the following instructions: \
${input}. Call set_timecodes_with_numeric_values once with the list of data values and timecodes.`,
    subModes: {
      Excitement:
        'for each scene, estimate the level of excitement on a scale of 1 to 10',
      Importance:
        'for each scene, estimate the level of overall importance to the video on a scale of 1 to 10',
      'Number of people': 'for each scene, count the number of people visible'
    }
  },

  Custom: {
    emoji: '🔧',
    prompt: input =>
      `Call set_timecodes once using the following instructions: ${input}`,
    isList: true
  }
}
