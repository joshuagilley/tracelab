package auth

// publicUserDTO is the JSON shape for /api/auth/me.
type publicUserDTO struct {
	ID                   string `json:"id"`
	GitHubID             int64  `json:"githubId"`
	Login                string `json:"login"`
	Name                 string `json:"name,omitempty"`
	AvatarURL            string `json:"avatarUrl,omitempty"`
	CurrentCareerTrackID string `json:"currentCareerTrackId,omitempty"`
}

type meResponse struct {
	User *publicUserDTO `json:"user"`
}

type logoutResponse struct {
	OK bool `json:"ok"`
}

func userToPublicDTO(u *User) *publicUserDTO {
	if u == nil {
		return nil
	}
	return &publicUserDTO{
		ID:                   u.ID.Hex(),
		GitHubID:             u.GitHubID,
		Login:                u.Login,
		Name:                 u.Name,
		AvatarURL:            u.AvatarURL,
		CurrentCareerTrackID: u.CurrentCareerTrackID,
	}
}
