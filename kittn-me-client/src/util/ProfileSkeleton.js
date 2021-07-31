import React from 'react';
import PropTypes from 'prop-types';
import NoImg from '../images/no-img.png';
import Paper from '@material-ui/core/Paper';

// Material UI
import withStyles from '@material-ui/core/styles/withStyles';

// Icons
import LocationOn from '@material-ui/icons/LocationOn';
import LinkIcon from '@material-ui/icons/Link';
import CalendarToday from '@material-ui/icons/CalendarToday';

const styles = (theme) => ({
    ...theme.spreadThis,
    handle: {
        height: 20,
        backgroundColor: "#8fbaff",
        width: 60, 
        margin: '0 auto 7px auto'
    },
    fullLine: {
        height: 15,
        backgroundColor: 'rgba(0,0,0,0.2)',
        width: '100%',
        marginBottom: 10, 
    },
    halfLine: {
        height: 15,
        backgroundColor: 'rgba(0,0,0,0.2)',
        width: '50%',
        marginBottom: 10, 
    }
});

const ProfileSkeleton = (props) => {
    const { classes } = props;
    return (
        <Paper className={classes.paper}>
            <div className={classes.profile}>
                <div className="image-wrapper">
                    <img src={NoImg} alt="profile" className="profile-image" />
                </div>
                <hr />
                <div className="profile-details">
                    <div className={classes.handle} />
                    <hr />
                    <div className={classes.fullLine} />
                    <div className={classes.fullLine} />
                    <LocationOn color="primary" /> <span>Location</span>
                    <hr />
                    <LinkIcon color="primary"/> https://web.cat
                    <hr/> 
                    <CalendarToday color="Primary"/> Joined date
                </div>
            </div>
        </Paper>
    )
}

ProfileSkeleton.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(ProfileSkeleton);