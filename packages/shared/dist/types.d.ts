export interface GitHubUser {
    githubId: number;
    username: string;
    displayName: string;
    email: string | null;
    avatarUrl: string;
    starredRepos: string[];
}
export interface AuthResponse {
    token: string;
    user: GitHubUser;
}
export interface GitHubOrg {
    login: string;
    id: number;
    avatar_url: string;
    description: string | null;
}
export interface GitHubRepo {
    id: number;
    name: string;
    full_name: string;
    owner: {
        login: string;
        avatar_url: string;
    };
    description: string | null;
    private: boolean;
    html_url: string;
    default_branch: string;
    updated_at: string;
    language: string | null;
}
export interface GitHubBranch {
    name: string;
    commit: {
        sha: string;
    };
    protected: boolean;
}
export interface TreeItem {
    path: string;
    mode: string;
    type: "blob" | "tree";
    sha: string;
    size?: number;
    url: string;
}
export interface FileContent {
    name: string;
    path: string;
    sha: string;
    size: number;
    content: string;
    encoding: string;
}
export interface CommitRequest {
    message: string;
    content: string;
    sha?: string;
    branch?: string;
}
export interface CommitResponse {
    content: {
        name: string;
        path: string;
        sha: string;
    };
    commit: {
        sha: string;
        message: string;
        html_url: string;
    };
}
export interface ApiError {
    message: string;
    status?: number;
}
//# sourceMappingURL=types.d.ts.map