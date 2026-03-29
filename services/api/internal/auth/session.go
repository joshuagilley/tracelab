package auth

import (
	"log"
	"net/http"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

func (h *Handler) startSession(w http.ResponseWriter, r *http.Request, userID primitive.ObjectID) error {
	jwtStr, err := signSession(h.cfg.JWTSecret, userID, sessionTTL)
	if err != nil {
		log.Printf("auth: sign session: %v", err)
		return err
	}
	http.SetCookie(w, h.sessionCookie(r, jwtStr))
	return nil
}
