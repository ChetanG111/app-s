export async function sendSlackNotification(message: string, data?: Record<string, any>) {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;

    if (!webhookUrl) {
        console.warn("SLACK_WEBHOOK_URL is not set");
        return;
    }

    try {
        const payload = {
            text: message,
            blocks: [
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: message,
                    },
                },
                ...(data ? [
                    {
                        type: "section",
                        fields: Object.entries(data).map(([key, value]) => ({
                            type: "mrkdwn",
                            text: `*${key}:*\n${value}`
                        }))
                    }
                ] : [])
            ],
        };

        await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
    } catch (error) {
        console.error("Failed to send Slack notification:", error);
    }
}
