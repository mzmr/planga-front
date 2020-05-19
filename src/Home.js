import React, { Component } from 'react';
import { Container } from 'reactstrap';
import './Home.css';
import Timetable from './Timetable';

class Home extends Component {

    constructor(props) {
        super(props);
        this.state = {
            timetableData: null
        };
    }

    async generateTimetable() {
		return fetch('/timetable/generate', {
			method: 'GET',
			headers: {
				'Accept': 'application/json'
			}
		}).then(response => response.json());
    }

    componentDidMount() {
        this.generateTimetable().then(data => this.setState({timetableData: data}));
    }

    render() {
        if (this.state.timetableData === null) {
            return 'Loading...';
        }
        return (
            <Container>
                <Timetable timetableData={this.state.timetableData} subject='group' subjectId={3} />
            </Container>
        );
    }
}
  
export default Home;