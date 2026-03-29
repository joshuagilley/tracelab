package auth

import (
	"errors"
	"net/http"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

const CookieName = "tracelab_session"

type sessionClaims struct {
	jwt.RegisteredClaims
}

func signSession(secret string, userID primitive.ObjectID, ttl time.Duration) (string, error) {
	if secret == "" {
		return "", errors.New("jwt secret empty")
	}
	now := time.Now()
	claims := sessionClaims{
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   userID.Hex(),
			ExpiresAt: jwt.NewNumericDate(now.Add(ttl)),
			IssuedAt:  jwt.NewNumericDate(now),
		},
	}
	t := jwt.NewWithClaims(jwt.SigningMethodHS256, &claims)
	return t.SignedString([]byte(secret))
}

// SessionUserID returns the user id from the tracelab_session cookie, or an error if missing/invalid.
func SessionUserID(secret string, r *http.Request) (primitive.ObjectID, error) {
	if secret == "" {
		return primitive.NilObjectID, errors.New("jwt secret empty")
	}
	c, err := r.Cookie(CookieName)
	if err != nil || c.Value == "" {
		return primitive.NilObjectID, errors.New("no session")
	}
	return parseSession(secret, c.Value)
}

func parseSession(secret, token string) (primitive.ObjectID, error) {
	if token == "" {
		return primitive.NilObjectID, errors.New("missing token")
	}
	var claims sessionClaims
	_, err := jwt.ParseWithClaims(token, &claims, func(t *jwt.Token) (any, error) {
		return []byte(secret), nil
	})
	if err != nil {
		return primitive.NilObjectID, err
	}
	if claims.Subject == "" {
		return primitive.NilObjectID, errors.New("invalid token")
	}
	return primitive.ObjectIDFromHex(claims.Subject)
}
