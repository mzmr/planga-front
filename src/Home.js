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
        const groupIdsWithDuplicates = this.state.timetableData.lessons.map(lesson => lesson.groupId);
        const groupIds = [...new Set(groupIdsWithDuplicates)].sort();
        const teacherIdsWithDuplicates = this.state.timetableData.lessons.map(lesson => lesson.teacherId);
        const teacherIds = [...new Set(teacherIdsWithDuplicates)].sort();
        const roomIdsWithDuplicates = this.state.timetableData.lessons.map(lesson => lesson.roomNumber);
        const roomIds = [...new Set(roomIdsWithDuplicates)].sort();
        return (
            <Container className='timetablesContainer'>
                {
                    groupIds.map(groupId =>
                        <div key={groupId}>
                            <div className='subjectTitle'>{`Grupa ${groupId}`}</div>
                            <Timetable timetableData={this.state.timetableData} subject='group' subjectId={groupId} />
                        </div>
                    )
                }
                {
                    teacherIds.map(teacherId =>
                        <div key={teacherId}>
                            <div className='subjectTitle'>{`Nauczyciel ${teacherId}`}</div>
                            <Timetable timetableData={this.state.timetableData} subject='teacher' subjectId={teacherId} />
                        </div>
                    )
                }
                {
                    roomIds.map(roomId =>
                        <div key={roomId}>
                            <div className='subjectTitle'>{`Sala ${roomId}`}</div>
                            <Timetable timetableData={this.state.timetableData} subject='room' subjectId={roomId} />
                        </div>
                    )
                }
            </Container>
        );
    }
}
  
export default Home;