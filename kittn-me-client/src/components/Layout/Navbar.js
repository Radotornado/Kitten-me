import React, { Component, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import MyButton from '../../util/MyButton';
import PostMeow from '../Meow/PostMeow';

// Material UI
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';

// Icons
import HomeIcon from '@material-ui/icons/Home';

export class Navbar extends Component {
    render() {
        const { authenticated } = this.props;
        return (
            <AppBar position="fixed">
                <Toolbar className="nav-container">
                    {authenticated ? (
                        <Fragment>
                            <PostMeow />
                            <Link to="/">
                                <MyButton tip="Home!">
                                    <HomeIcon />
                                </MyButton>
                            </Link>
                        </Fragment>
                    ) : (
                            <Fragment>
                                <Button color="inherit" component={Link} to="/login">Login</Button>
                                <Button color="inherit" component={Link} to="/">Home</Button>
                                <Button color="inherit" component={Link} to="/signup">Signup</Button>
                            </Fragment>
                        )
                    }
                </Toolbar>
            </AppBar >
        );
    };
};

Navbar.propTypes = {
    authenticated: PropTypes.bool
}

const mapStateToProps = state => ({
    authenticated: state.user.authenticated
});

export default connect(mapStateToProps)(Navbar);