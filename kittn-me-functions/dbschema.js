let db = {
    users: [{
        userId: 'DYVYxcdY1yx9NsfDZzTc',
        email: 'user@email.com',
        handle: 'user',
        createdAt: '2020-10-15T10:59:52.798Z',
        imageUrl: 'image/14429436079.jpg',
        bio: 'Meow, my name is Nymphy, nice to scratch you',
        website: 'https://user.com',
        location: 'London, UK'
    }],
    meows: [{
        userHandle: 'user',
        body: 'This is a sample meow',
        createdAt: '2020-10-15T10:59:52.798Z',
        likeCount: 5,
        commentCount: 3
    }],
    comments: [{
        userHandle: 'user',
        meowId: 'DYVYxcdY1yx9NsfDZzTc',
        body: 'thats deep I purr it a lot',
        createdAt: '2020-10-15T10:59:52.798Z'
    }],
    notifications: [{
        recipient: 'user',
        sender: 'john',
        read: 'true | false',
        meowId: 'DYVYxcdY1yx9NsfDZzTc',
        type: 'like | comment',
        createdAt: '2020-10-15T10:59:52.798Z'
    }]
}

let userDetails = {
    // Redux data
    credentials: {
        userId: 'DYVYxcdY1yx9NsfDZzTc',
        email: 'user@email.com',
        handle: 'user',
        createdAt: '2020-10-15T10:59:52.798Z',
        imageUrl: 'image/14429436079.jpg',
        bio: 'Meow, my name is Nymphy, nice to scratch you',
        website: 'https://user.com',
        location: 'London, UK'
    },
    likes: [{
        userHandle: 'user',
        meowId: 'DYVYxcdY1yx9NsfDZzTc'
    }, {
        userHandle: 'user2',
        meowId: 'DYVYxcdY1yx9NsfDZzTd'
    }]
}