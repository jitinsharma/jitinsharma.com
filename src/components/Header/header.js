import { withPrefix, Link } from 'gatsby';
import PropTypes from "prop-types"
import React from "react"

import "./header.css"

const Header = ({ siteTitle, author }) => (
    <header className="Header">
        <div style={{width: `500px`, margin: `0 auto`}}>
            <img className="photo" src={withPrefix(author.photo)} width="75" height="75" style={{float: `left`}}/>
            <strong><p style={{fontSize: `3rem`, paddingTop: `1rem`, marginLeft: `1rem`}}>Jitin Sharma</p></strong>
        </div>
    
        {/* <div
            style={{
                margin: `0 auto`,
                maxWidth: 1500,
                padding: `1.45rem 1.0875rem`,
                overflow: `auto`,
                textAlign: 'center'
            }}>
            <img
                src={withPrefix(author.photo)}
                className="photo"
                width="75"
                height="75"
                alt={author.name}
            />
            <h1 style={{ margin: 0 }}>
                <Link
                    to="/"
                    style={{
                        color: `black`,
                        textDecoration: `none`,
                    }}>
                    {siteTitle}
                </Link>
            </h1>
        </div> */}
    </header>
        )
        
Header.propTypes = {
            siteTitle: PropTypes.string,
    }
    
Header.defaultProps = {
            siteTitle: ``,
    }
    
export default Header