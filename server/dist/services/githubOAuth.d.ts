export declare const getAuthorizationUrl: () => string;
export declare const exchangeCodeForToken: (code: string) => Promise<string>;
export declare const fetchGitHubUser: (accessToken: string) => Promise<{
    githubId: number;
    username: string;
    displayName: string;
    email: string | null;
    avatarUrl: string;
}>;
//# sourceMappingURL=githubOAuth.d.ts.map