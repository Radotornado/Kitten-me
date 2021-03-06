import React, { Component } from 'react';

import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import MyButton from '../../util/MyButton';
import MeowDialog from './MeowDialog';
import LikeButton from './LikeButton';

// date formatting
import relativeTime from 'dayjs/plugin/relativeTime';
import dayjs from 'dayjs';

// Material UI
import withStyles from '@material-ui/core/styles/withStyles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import DeleteMeow from './DeleteMeow';

// Icons
import ChatIcon from '@material-ui/icons/Chat';

// Redux
import { connect } from 'react-redux';

const styles = {
    card: {
        position: 'relative',
        display: 'flex',
        marginBottom: 20
    },
    image: {
        minWidth: 200
    },
    content: {
        padding: 25,
        objectFit: 'cover'
    }
}

class Meow extends Component {
    render() {
        dayjs.extend(relativeTime);
        const {
            classes,
            meow: {
                body,
                createdAt,
                userImage,
                userHandle,
                meowId,
                likeCount,
                commentCount
            },
            user: {
                authenticated,
                credentials: {
                    handle
                }
            }
        } = this.props;
        const deleteButton =
            authenticated && userHandle === handle ? (
                <DeleteMeow meowId={meowId} />
            ) : null;
        return (
            <Card className={classes.card}>
                <CardMedia
                    image={userImage}
                    title="Profile image"
                    className={classes.image} />
                <CardContent className={classes.content}>
                    <Typography
                        variant="h5"
                        component={Link}
                        to={`/users/${userHandle}`}
                        color="primary"
                    >
                        {userHandle}
                    </Typography>
                    {deleteButton}
                    <Typography variant="body2" color="textSecondary">
                        {dayjs(createdAt).fromNow()}
                    </Typography>
                    <Typography variant="body1">
                        {body}
                    </Typography>
                    <LikeButton meowId={meowId} />
                    <span>{likeCount} Likes</span>
                    <MyButton tip="comments">
                        <ChatIcon color="primary" />
                    </MyButton>
                    <span>{commentCount} Comments</span>
                    <MeowDialog meowId={meowId} userHandle={userHandle} openDialog={this.props.openDialog} />
                </CardContent>
            </Card>
        );
    }
}

Meow.propTypes = {
    user: PropTypes.object.isRequired,
    meow: PropTypes.object.isRequired,
    classes: PropTypes.object.isRequired,
    openDialog: PropTypes.bool
};

const mapStateToProps = state => ({
    user: state.user
});

export default connect(mapStateToProps)(withStyles(styles)(Meow));