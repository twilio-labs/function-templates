const autopilotDefinition = {
	"style_sheet": {
		"voice": {
			"say_voice": "Polly.Salli-Neural"
		},
		"collect": {
			"validate": {
				"on_failure": {
					"messages": [
						{
							"say": "I'm sorry, can you please say that again"
						},
						{
							"say": "hmm I still didn't catch that, can you please repeat"
						},
						{
							"say": "Let's give it one more try. Please say it one more time"
						}
					],
					"repeat_question": false
				},
				"on_success": {
					"say": ""
				},
				"max_attempts": 4
			}
		}
	}
}


module.exports = autopilotDefinition;