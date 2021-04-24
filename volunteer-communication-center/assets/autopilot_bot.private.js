const autopilotDefinition = {
    "friendlyName" : "Henry",
    "logQueries" : true,
    "uniqueName" : "nemoooo",
    "defaults" : {
        "defaults" : {
            "assistant_initiation" : "task://greeting",
            "fallback" : "task://fallback",
            "collect" : {
                "validate_on_failure" : "task://collect_fallback"
            }
        }
    },
    "styleSheet" : {
        "style_sheet" : {
            "collect" : {
                "validate" : {
                    "on_failure" : {
                        "repeat_question" : false,
                        "messages" : [
                            {
                                "say" : {
                                    "speech" : "I didn't get that. What did you say?"
                                }
                            },
                            {
                                "say" : {
                                    "speech" : "I still didn't catch that. Please repeat."
                                }
                            },
                            {
                                "say" : {
                                    "speech" : "Let's try one last time. Say it again please."
                                }
                            }
                        ]
                    },
                    "on_success" : { "say" : { "speech" : "" } },
                    "max_attempts" : 4
                }
            },
            "voice" : {
                "say_voice" : "Polly.Matthew"
            },
            "name" : ""
        }
    },
    "fieldTypes" : [],
    "tasks" : [
        {
            "uniqueName" : "incomplete_training",
            "actions" : {
                "actions" : [
                    {
                        "say" : "Incomplete volunteer trainings can be found through the volunteer portal under the 'Trainings' tab at [www.twilio.org]. There is a section titled, 'Incomplete Trainings.'"
                    },
                    {
                        "redirect" : "task://ask_for_input"
                    }
                ]
            },
            "fields" : [],
            "samples" : [
                {
                    "language" : "en-US",
                    "taggedText" : "What trainings do I need?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "what trainings do i need"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "Do I have any training left?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "What training have I not done?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "What training do I have to do?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "Is there any trainings I haven't done?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "Am I finished with my training?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "What courses do I have left?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "Have I completed the trainings?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "have i completed the trainings"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "do i have any training left"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "what training have i not done"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "what training do i have to do"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "is there any trainings i have not done"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "am i finished with trainings"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "what courses do i have left"
                }
            ]
        },
        {
            "uniqueName" : "event_basicdetails",
            "actions" : {
                "actions" : [
                    {
                        "say" : "Information regarding upcoming volunteer events can be found on the volunteer portal under the 'Events' tab at [www.twilio.org]."
                    },
                    {
                        "redirect" : "task://ask_for_input"
                    }
                ]
            },
            "fields" : [],
            "samples" : [
                {
                    "language" : "en-US",
                    "taggedText" : "When is x event? "
                },
                {
                    "language" : "en-US",
                    "taggedText" : "What time is x event?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "What day is x event? "
                },
                {
                    "language" : "en-US",
                    "taggedText" : "When do I need to show up for x event"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "when be x "
                },
                {
                    "language" : "en-US",
                    "taggedText" : "when and where is x event"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "what day is x"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "when is x"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "where is x event"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "where will x be"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "what location is x at"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "where is x going to be"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "where is x"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "where will x be held"
                }
            ]
        },
        {
            "uniqueName" : "training_signup",
            "actions" : {
                "actions" : [
                    {
                        "say" : "A list of training options and times can be found on the volunteer portal under the 'Training' tab at [www.twilio.org]."
                    },
                    {
                        "redirect" : "task://ask_for_input"
                    }
                ]
            },
            "fields" : [],
            "samples" : [
                {
                    "language" : "en-US",
                    "taggedText" : "how do i sign up for training"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "where do i go to sign up for training"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "where do i find the trainings"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "where are the trainings"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "where be trainings"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "where are trainings found"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "how do i find the trainings"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "how do i find trainings"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "how do i go to trainings"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "when are trainings"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "How do I sign up for training?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "Where do I go to sign up for training? "
                },
                {
                    "language" : "en-US",
                    "taggedText" : "Where do I find the trainings? "
                },
                {
                    "language" : "en-US",
                    "taggedText" : "Where are the trainings? "
                },
                {
                    "language" : "en-US",
                    "taggedText" : "Where be trainings? "
                },
                {
                    "language" : "en-US",
                    "taggedText" : "Where are trainings found? "
                },
                {
                    "language" : "en-US",
                    "taggedText" : "How do I find the trainings? "
                },
                {
                    "language" : "en-US",
                    "taggedText" : "How do I find trainings? "
                },
                {
                    "language" : "en-US",
                    "taggedText" : "How do I go to trainings? "
                },
                {
                    "language" : "en-US",
                    "taggedText" : "When are trainings? "
                }
            ]
        },
        {
            "uniqueName" : "event_prereq",
            "actions" : {
                "actions" : [
                    {
                        "say" : "To see what training is required for upcoming events, go to the 'Events' tab in the volunteer portal at [www.twilio.org], go to the event you are interested in, and click on 'Required Training'."
                    },
                    {
                        "redirect" : "task://ask_for_input"
                    }
                ]
            },
            "fields" : [],
            "samples" : [
                {
                    "language" : "en-US",
                    "taggedText" : "what do i need to do so i can go to events"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "how can i prepare for events"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "does the event have required training?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "what do i need to do to sign up for an event"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "do i need to fill out a form for an event"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "prerequisite activities for events"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "Prerequisite activities for an event?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "What do I need to do so I can go to events?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "How can I prepare for events?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "Does the event have required training"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "What do I need to do to sign up for an event?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "Do I need to fill out a form for an event?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "Do I need special training for the event"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "What special training might I need for the event"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "Where do I find training for the event"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "Does this assignment have prereqs"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "Where is the training for this assignment"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "What do I need to be able to do this event"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "How can I prepare for my task"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "What trainings do I need to take for my event"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "What should I do before the event"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "What do I need to do before my shift"
                }
            ]
        },
        {
            "uniqueName" : "help",
            "actions" : {
                "actions" : [
                    {
                        "say" : "Here are some topics I have information on:\n- Shift times and logging hours\n- Transportation availability\n- Coordinator Contact Info and contact preferences\n- Volunteer training signup and tracking\n- Event details, signups, and prerequisites.\nIf I cannot help you with your question, ask me to connect you to a volunteer coordinator.\nWhat can I help you with?"
                    },
                    { "listen" : true }
                ]
            },
            "fields" : [],
            "samples" : [
                {
                    "language" : "en-US",
                    "taggedText" : "What can you do?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "what can i ask"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "What can i do?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "what can I do"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "What are the commands"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "i need help."
                },
                {
                    "language" : "en-US",
                    "taggedText" : "what options are there"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "what do you know"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "what do you do"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "what can i say"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "can i get some help"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "Can i get some help?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "Help?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "help"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "What can I ask?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "what can you do?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "what are the commands?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "I need help"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "What options are there?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "What do you do?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "What do you know?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "What can I say?"
                }
            ]
        },
        {
            "uniqueName" : "completed_training",
            "actions" : {
                "actions" : [
                    {
                        "say" : "Completed volunteer trainings can be found through the volunteer portal under the 'Trainings' tab at [www.twilio.org]. There is a section titled, 'Completed Trainings'."
                    },
                    {
                        "redirect" : "task://ask_for_input"
                    }
                ]
            },
            "fields" : [],
            "samples" : [
                {
                    "language" : "en-US",
                    "taggedText" : "what training have i finished"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "which courses have i completed"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "which trainings have i done"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "what courses have i done"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "what trainings have i completed"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "what trainings do i have left"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "completed trainings"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "finished trainings"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "What training have I finished?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "Which courses have I completed?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "Which trainings have I done?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "What courses have I done?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "What trainings have I completed?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "What trainings do I have left?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "Completed trainings?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "Finished trainings?"
                }
            ]
        },
        {
            "uniqueName" : "preferences",
            "actions" : {
                "actions" : [
                    {
                        "say" : "To change your contact preferences, open the settings button in the bottom right corner of your Volunteer app, hit preferences, and update your information there."
                    },
                    {
                        "redirect" : "task://ask_for_input"
                    }
                ]
            },
            "fields" : [],
            "samples" : [
                {
                    "language" : "en-US",
                    "taggedText" : "what are my contact preferences?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "how do i update my contact settings?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "how do I change my email settings?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "how do I update my phone number?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "Settings"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "Preferences"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "change settings"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "Change Preferences"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "where do I change my contact preferences?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "Where do I change my contact preferences"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "What are my contact preferences"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "How do I update my contact settings"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "How do I change my email setting"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "How do I update my phone number"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "settings?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "preferences?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "Change settings?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "change preferences?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "can i update my settings"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "Can I update my settings?"
                }
            ]
        },
        {
            "uniqueName" : "primary_contact",
            "actions" : {
                "actions" : [
                    {
                        "say" : "The primary contacts for events are listed in the events description, which you can find in the volunteer portal under the 'Events' tab at [www.twilio.org].\nTo talk to a coordinator, just say \"Connect me to a coordinator\"."
                    },
                    {
                        "redirect" : "task://ask_for_input"
                    }
                ]
            },
            "fields" : [],
            "samples" : [
                {
                    "language" : "en-US",
                    "taggedText" : "Coordinator"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "who do i talk to if i need help"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "who is my coordinator"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "who should i contact?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "who can i speak to?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "who should i talk to for this trip?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "who is in charge?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "who is my direct coontact"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "Contact"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "coordinator?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "Who do I talk to if I need help?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "Who is my coordinator?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "Who should I contact"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "Who can I speak to"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "Who should I talk to for this trip"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "Who is in charge"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "Who is my direct contact?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "contact?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "who do I ask questions?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "Who do i ask questions"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "contact info"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "Contact Info"
                }
            ]
        },
        {
            "uniqueName" : "hours",
            "actions" : {
                "actions" : [
                    {
                        "say" : "You can log your hours on the volunteer portal under the 'Track Time' tab at [www.twilio.org].\nMake sure to log into your account."
                    },
                    {
                        "redirect" : "task://ask_for_input"
                    }
                ]
            },
            "fields" : [],
            "samples" : [
                {
                    "language" : "en-US",
                    "taggedText" : "how do i log my hours"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "where should I put my hours?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "how can i track my hours?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "where do i enter the time ive spent?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "where is the link to log my hours?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "i would like to enter my hours."
                },
                {
                    "language" : "en-US",
                    "taggedText" : "hours"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "can i log my hours"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "How do I log my hours"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "Where should I put my hours"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "How can I track my hours"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "Where do I enter the time I've spent"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "Where is the link to log my hours"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "I would like to enter my hours"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "Hours?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "Can I log my hours?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "track hours"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "Track Hours?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "Log Timecard?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "log timecard"
                }
            ]
        },
        {
            "uniqueName" : "transportation",
            "actions" : {
                "actions" : [
                    {
                        "say" : "Transportation is not provided unless otherwise indicated in the event description, which you can find in the volunteer portal under the 'Events' tab at [www.twilio.org]. "
                    },
                    {
                        "redirect" : "task://ask_for_input"
                    }
                ]
            },
            "fields" : [],
            "samples" : [
                {
                    "language" : "en-US",
                    "taggedText" : "is transportation provided"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "is there transportation?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "do i need to go there myself?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "do i need to bring my car?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "how should i travel there?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "will i be given transportation options"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "how do i get there"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "Is transportation provided?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "Is there transportation"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "Do I need to go there myself"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "Do I need to bring my car"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "How should I travel there"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "Will I be given transportation options?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "How do I get there?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "how do i arrange transportation"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "How do I arrange transportation?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "transportation information"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "Transportation Information"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "travel info"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "Travel Info"
                }
            ]
        },
        {
            "uniqueName" : "next_shift",
            "actions" : {
                "actions" : [
                    {
                        "say" : "You can see your next shift on the volunteer portal under the 'Events' tab at [www.twilio.org]. If you're not signed up for shifts, the calendar will be empty."
                    },
                    {
                        "redirect" : "task://ask_for_input"
                    }
                ]
            },
            "fields" : [],
            "samples" : [
                {
                    "language" : "en-US",
                    "taggedText" : "when do i go in"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "when am i needed next"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "when am i up next"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "when do i need to be there"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "do i have any upcoming shifts"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "when am i scheduled next"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "next shift"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "when is my next shift"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "When is my next shift?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "Next shift?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "When am I scheduled next?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "When do I go in?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "When am I needed next?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "When am I up next?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "When do I need to be there?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "Do i have any upcoming shifts?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "whats my schedule"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "What is my schedule?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "Did I sign up for any shifts?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "did i sign up for any shifts"
                }
            ]
        },
        {
            "uniqueName" : "fallback",
            "actions" : {
                "actions" : [
                    {
                        "say" : "I'm sorry, I didn't catch that. Can you repeat your question?"
                    },
                    { "listen" : true }
                ]
            },
            "fields" : [],
            "samples" : [
                {
                    "language" : "en-US",
                    "taggedText" : "go"
                }
            ]
        },
        {
            "uniqueName" : "greeting",
            "actions" : {
                "actions" : [
                    {
                        "say" : "Hello! My name is Henry. What can I help you with today?\nI can help you with questions about upcoming events, where to find information about volunteer training, or your hours.\nFor more information, please ask \"What can I do?\""
                    },
                    { "listen" : true }
                ]
            },
            "fields" : [],
            "samples" : [
                {
                    "language" : "en-US",
                    "taggedText" : "hello"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "Hi"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "good morning"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "hi there"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "heya"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "good afternoon"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "hi there."
                },
                {
                    "language" : "en-US",
                    "taggedText" : "what'us up"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "hi!"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "Hello."
                },
                {
                    "language" : "en-US",
                    "taggedText" : "yo"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "sup"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "what can you do"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "hey"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "what do you do"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "whatsup"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "come back"
                }
            ]
        },
        {
            "uniqueName" : "collect_fallback",
            "actions" : {
                "actions" : [
                    {
                        "say" : "Looks like I'm having trouble. Apologies for that. Let's start again, how can I help you today?"
                    },
                    { "listen" : true }
                ]
            },
            "fields" : [],
            "samples" : []
        },
        {
            "uniqueName" : "goodbye",
            "actions" : {
                "actions" : [
                    {
                        "say" : "Thank you! Please reach out again if you need anything. Goodbye."
                    }
                ]
            },
            "fields" : [],
            "samples" : [
                {
                    "language" : "en-US",
                    "taggedText" : "that's all for today"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "that would be all"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "that is all thank you"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "no"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "no thanks"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "go away"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "that would be all thanks"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "no thanks"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "goodbye"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "stop talking"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "bye bye"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "that's all"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "goodnight"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "cancel"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "stop"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "see ya"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "good bye"
                }
            ]
        },
        {
            "uniqueName" : "send_to_agent",
            "actions" : {
                "actions" : [
                    {
                        "say" : "Would you like to connect to a [coordinator]?"
                    }
                ]
            },
            "fields" : [],
            "samples" : [
                {
                    "language" : "en-US",
                    "taggedText" : "Connect me to a coordinator"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "How do I call the coordinator"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "Please connect me to the organization"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "I would like to contact someone"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "Can you redirect me to someone"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "Can I talk to a person"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "Can I speak to the office"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "Can you connect me to a coordinator"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "can you connect me to coordinator?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "connect me to a coordinator."
                },
                {
                    "language" : "en-US",
                    "taggedText" : "how do i call the coordinator?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "please connect me to the organization."
                },
                {
                    "language" : "en-US",
                    "taggedText" : "i would like to contact someone"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "can you redirect me to someone?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "can i talk to a person?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "can i speak to the office?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "talk to coordinator"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "Talk to coordinator."
                },
                {
                    "language" : "en-US",
                    "taggedText" : "i want to talk with someone"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "I want to talk to someone."
                }
            ]
        },
        {
            "uniqueName" : "ask_for_input",
            "actions" : {
                "actions" : [
                    {
                        "say" : "Is there anything else I can help you with?"
                    },
                    { "listen" : true }
                ]
            },
            "fields" : [],
            "samples" : []
        },
        {
            "uniqueName" : "no_follow_up_qs",
            "actions" : {
                "actions" : [
                    {
                        "say" : "I'm sorry. I can't respond to follow up questions right now."
                    },
                    {
                        "redirect" : "task://ask_for_input"
                    }
                ]
            },
            "fields" : [],
            "samples" : [
                {
                    "language" : "en-US",
                    "taggedText" : "do I need a login"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "Do I need a login?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "where is that website"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "Where is that website?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "what is that website"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "What is that website?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "where does that live"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "Where does that live?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "where is that resource"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "Where is that resource?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "where can I find that"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "Where can I find that?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "what does that mean"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "What does that mean?"
                }
            ]
        },
        {
            "uniqueName" : "shift_signup",
            "actions" : {
                "actions" : [
                    {
                        "say" : "You can signup for shifts on the volunteer portal at [www.twilio.org]. Navigate to the 'Shifts' tab and click 'Signup' to see available times."
                    },
                    {
                        "redirect" : "task://ask_for_input"
                    }
                ]
            },
            "fields" : [],
            "samples" : [
                {
                    "language" : "en-US",
                    "taggedText" : "can i signup for a shift"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "Can I sign up for a shift?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "Where do i signup for shifts?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "where do I sign up for shifts"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "i want to signup for shifts"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "I want to sign up for shifts"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "Shift sign up"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "shift signup"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "how do i signup for shifts"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "How do I sign up for more shifts?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "Where is the shift sign up?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "where is the shift signup"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "can i signup for shifts"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "Can I sign up for shifts?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "When is the next open shift?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "when's the next open shift?"
                }
            ]
        },
        {
            "uniqueName" : "event_signup",
            "actions" : {
                "actions" : [
                    {
                        "say" : "Please go to the volunteer portal under the 'Events' tab at [twilio.com]. To sign up for events, go to the 'Sign-Up' link under the 'Events' tab."
                    },
                    {
                        "redirect" : "task://ask_for_input"
                    }
                ]
            },
            "fields" : [],
            "samples" : [
                {
                    "language" : "en-US",
                    "taggedText" : "How can I help with this event?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "where is the signup for events"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "I want to sign up for events"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "Where is the signup for events?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "Where is the event sign-up?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "Where do I sign up for an event?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "How do I signup for an event?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "how do i sign up for an event"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "i want to sign up for an event"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "how can i help with an event"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "where is the event sign-up"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "where do i sign up for an event"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "What events are coming up?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "what events are coming up"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "can i sign up for events"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "Can I sign up for events?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "Are there any upcoming events?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "are there any upcoming events"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "event sign up"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "Event signup"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "Can I sign up?"
                },
                {
                    "language" : "en-US",
                    "taggedText" : "can i sign up"
                }
            ]
        }
    ],
    "modelBuild" : {
        "uniqueName" : "Volunteer_FAQ_Chatbot_13-4-2021_3.45.53pm"
    }
};

module.exports = autopilotDefinition;