package auth

const (
	hintMissingEnv = "Set MONGO_DB_URI, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, OAUTH_CALLBACK_URL, AUTH_JWT_SECRET on the API service (Cloud Run → tracelab-api → Variables & secrets)."
	hintMongoDown  = "OAuth env may be set, but MongoDB is not connected. Check MONGO_DB_URI, Atlas Network Access (allow Cloud Run egress), and API logs for mongo: connect failed."
)
