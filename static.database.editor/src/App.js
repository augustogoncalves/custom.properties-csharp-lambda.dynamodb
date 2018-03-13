import React, { Component } from 'react';
import { GlobalNav } from 'hig-react';
import 'hig-react/lib/hig-react.css';
import './App.css';

import {
  ReflexContainer,
  ReflexSplitter,
  ReflexElement
} from 'react-reflex'

import 'react-reflex/styles.css'

class App extends Component {
  render() {
    return (
      <GlobalNav
        onModuleChange={(activeModuleId) => { console.log(activeModuleId); }}
        topNav={
          {
            logo: '//developer.static.autodesk.com/images/logo_forge-2-line.png',
            logoLink: '//developer.autodesk.com',
          }
        } >
        <div className="reflex">
          <ReflexContainer orientation="vertical">
            <ReflexElement className="left-pane" minSize="200" maxSize="800">
              <div className="pane-content">
              </div>
            </ReflexElement>
            <ReflexSplitter />
            <ReflexElement className="right-pane">
              <div className="pane-content">
              </div>
            </ReflexElement>
          </ReflexContainer>
        </div>
      </GlobalNav>
    );
  }
}

export default App;
