import React, {PropTypes} from 'react';
import style from './HomePage.scss';
import styleable from 'react-styleable';
import helpers from '../helpers.scss';
import classnames from 'classnames';
import backgroundImage from '../resource/background.jpg';

class HomePage extends React.Component {
  constructor() {
    super();
    this.gotoDisk = this.gotoDisk.bind(this);
  }

  gotoDisk() {
    event.preventDefault();
    this.context.router.push({pathname: '/cloud/disk', query: this.props.location.query});
  }

  render() {
    var css = this.props.css;
    return (
      <div className={css.home}>
        <div style={{
          backgroundImage: 'Url("' + backgroundImage + '")'
        }} className={classnames(css.backgroundBlockHome, helpers['background-block'])}>
          <div className={classnames(css.infoBlock, helpers['center'])}>
            <h1 className={css.homeHeading}>starC 3 - Disk</h1>
            <button onClick={this.gotoDisk} className={classnames(helpers['button-hollow'], css.getMore, helpers['center'])}>我的网盘</button>
          </div>
          <div className={helpers['overlay']}></div>
        </div>
      </div>
    );
  }
}

HomePage.contextTypes = {
  router: React.PropTypes.object.isRequired
};

export default styleable(style)(HomePage);
