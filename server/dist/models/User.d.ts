import mongoose from "mongoose";
export declare const User: mongoose.Model<{
    githubId: number;
    username: string;
    displayName: string;
    avatarUrl: string;
    accessToken: string;
    starredRepos: string[];
    email?: string | null | undefined;
} & mongoose.DefaultTimestampProps, {}, {}, {}, mongoose.Document<unknown, {}, {
    githubId: number;
    username: string;
    displayName: string;
    avatarUrl: string;
    accessToken: string;
    starredRepos: string[];
    email?: string | null | undefined;
} & mongoose.DefaultTimestampProps, {}, {
    timestamps: true;
}> & {
    githubId: number;
    username: string;
    displayName: string;
    avatarUrl: string;
    accessToken: string;
    starredRepos: string[];
    email?: string | null | undefined;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    githubId: number;
    username: string;
    displayName: string;
    avatarUrl: string;
    accessToken: string;
    starredRepos: string[];
    email?: string | null | undefined;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    githubId: number;
    username: string;
    displayName: string;
    avatarUrl: string;
    accessToken: string;
    starredRepos: string[];
    email?: string | null | undefined;
} & mongoose.DefaultTimestampProps>, {}, mongoose.MergeType<mongoose.DefaultSchemaOptions, {
    timestamps: true;
}>> & mongoose.FlatRecord<{
    githubId: number;
    username: string;
    displayName: string;
    avatarUrl: string;
    accessToken: string;
    starredRepos: string[];
    email?: string | null | undefined;
} & mongoose.DefaultTimestampProps> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
//# sourceMappingURL=User.d.ts.map