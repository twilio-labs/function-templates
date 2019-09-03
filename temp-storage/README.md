# Utilise temporary storage under Functions

This Function shows you how to reach and utilise the temporary storage under the Function layer, mainly for single-invocation jobs
For example, on each invocation we can create a file based on user data and use it accordingly

IMPORTANT: Do NOT treat this storage as long term storage or for personal data that need to persist.
The contents get deleted whenever the associated container is brought down, so this function is useful for one time actions

## Environment variables

This Function does not require any environment variables to be set                                                  

## Parameters

This Function doesn't expect any parameters passed.
