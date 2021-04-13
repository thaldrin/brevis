import axios from "axios"


export async function logToDiscord(message: string, webhook?: string) {

    if (process.env.BREVIS_WEBHOOK) {

        try {
            let req = await axios.post(process.env.BREVIS_WEBHOOK, {
                username: "Brevis",
                content: message
            })

            return req
        } catch (error) {
            console.error(error)
        }

    } else return
}