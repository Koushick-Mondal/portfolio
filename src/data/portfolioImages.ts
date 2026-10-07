const baseUrl = import.meta.env.BASE_URL;

export const portfolioImages = {
  profile: {
    primary: `${baseUrl}images/profile/koushick.jpg`,
  },
  projects: {
    // Add only verified screenshots here. Abstract project visuals remain the fallback until real screenshots are supplied.
  } as Record<string, string>,
  experience: {} as Record<string, string>,
  achievements: {} as Record<string, string>,
};
