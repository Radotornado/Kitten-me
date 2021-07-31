import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getMeows } from '../redux/actions/dataActions';

// grid from Material UI
import Grid from '@material-ui/core/Grid';

// components
import Meow from '../components/Meow/Meow';
import Profile from '../components/Profile/Profile'
import MeowSkeleton from '../util/MeowSkeleton';

class home extends Component {
    componentDidMount() {
        this.props.getMeows();
    }
    render() {
        const { meows, loading } = this.props.data;
        // check for meows
        let recentMeowsMarkup = !loading ? (
            meows.map((meow) => <Meow key={meow.meowId} meow={meow} />)
        ) : (
                <MeowSkeleton/>
            );
        return (
            <Grid container spacing={6}>
                <Grid item sm={8} xs={12}>
                    {recentMeowsMarkup}
                </Grid>
                <Grid item sm={4} xs={12}>
                    <Profile />
                </Grid>
            </Grid>
        );
    };
};

home.propTypes = {
    getMeows: PropTypes.func.isRequired,
    data: PropTypes.object.isRequired
}

const mapStateToProps = state => ({
    data: state.data
});

export default connect(mapStateToProps, { getMeows })(home);