const { User, Journal } = require("../models");
const { AuthenticationError } = require("apollo-server-express");
const { signToken } = require("../utils/auth");
const resolvers = {
    Query: {
        me: async(parent, args, context) => {
            if (context.user) {
                const userData = await User.findOne({ _id: context.user._id })
                    .select("-__v -password")
                    .populate("journals");

                return userData;
            }

            throw new AuthenticationError("Not logged in");
        },
        journals: async(parent, { username }) => {
            const params = username ? { username } : {};
            return Journal.find(params).sort({ createdAt: -1 });
        },
        journal: async(parent, { _id }) => {
            return Journal.findOne({ _id });
        },
        // get all users
        users: async() => {
            return User.find()
                .select("-__v -password")
                .populate("journals");
        },
        // get a user by username
        user: async(parent, { username }) => {
            return User.findOne({ username })
                .select("-__v -password")
                .populate("journals");
        }
    },
    Mutation: {
        addUser: async(parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);

            return { token, user };
        },

        login: async(parent, { email, password }) => {
            const user = await User.findOne({ email });

            if (!user) {
                throw new AuthenticationError("Incorrect credentials");
            }

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw new AuthenticationError("Incorrect credentials");
            }
            const token = signToken(user);

            return { token, user };
        },
        addJournal: async(parent, args, context) => {
            if (context.user) {
                const journal = await Journal.create({
                    ...args,
                    username: context.user.username
                });

                await User.findByIdAndUpdate({ _id: context.user._id }, {
                    $push: {
                        journals: journal._id,
                        heading: journal.heading,
                        journalTex: journal.journalTex,
                        img: journal.img
                    }
                }, { new: true });

                return journal;
            }

            throw new AuthenticationError("You need to be logged in!");
        },
        deleteJournal: async(parent, args, context) => {
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate({ _id: context.user._id }, { $pull: { savedJournal: { journalId: args.journalId } } }, { new: true });
                return updatedUser;
            }
            throw new AuthenticationError('You need to be logged in!');
        },
        addComment: async(parent, { journalId, commentBody }, context) => {
            if (context.user) {
                const updatedJournal = await Journal.findOneAndUpdate({ _id: journalId }, {
                    $push: {
                        comments: { commentBody, username: context.user.username }
                    }
                }, { new: true, runValidators: true });

                return updatedJournal;
            }

            throw new AuthenticationError("You need to be logged in!");
        }
    }
};

module.exports = resolvers;