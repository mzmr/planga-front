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

        const laboratoryTuplesWithDuplicates = this.state.timetableData.lessons
            .filter(lesson => lesson.groupType === 'LABORATORY')
            .map(lesson => {
                return {
                    lecture: lesson.lectureGroupId, 
                    auditory: lesson.auditoryGroupId, 
                    laboratory: lesson.laboratoryGroupId
                };
            });

        const laboratoryTuples = laboratoryTuplesWithDuplicates
            .filter((lesson, index, self) =>
                index === self.findIndex((comparedLesson) => (
                    comparedLesson.lecture === lesson.lecture &&
                    comparedLesson.auditory === lesson.auditory &&
                    comparedLesson.laboratory === lesson.laboratory
                )))
            .sort((lesson1, lesson2) => {
                if (lesson1.lecture !== lesson2.lecture) {
                    return lesson1.lecture - lesson2.lecture;
                }
                if (lesson1.auditory !== lesson2.auditory) {
                    return lesson1.auditory - lesson2.auditory;
                }
                if (lesson1.laboratory !== lesson2.laboratory) {
                    return lesson1.laboratory - lesson2.laboratory;
                }
                return 0;
            });

        const teacherIdsWithDuplicates = this.state.timetableData.lessons.map(lesson => lesson.teacherId);
        const teacherIds = [...new Set(teacherIdsWithDuplicates)].sort();
        const roomIdsWithDuplicates = this.state.timetableData.lessons.map(lesson => lesson.roomNumber);
        const roomIds = [...new Set(roomIdsWithDuplicates)].sort();
        return (
            <Container className='timetablesContainer'>
                {
                    laboratoryTuples.map(laboratoryTuple =>
                        <div key={`${laboratoryTuple.lecture}.${laboratoryTuple.auditory}.${laboratoryTuple.laboratory}`}>
                            <div className='subjectTitle'>{`Grupa ${laboratoryTuple.lecture}.${laboratoryTuple.auditory}.${laboratoryTuple.laboratory}`}</div>
                            <Timetable timetableData={this.state.timetableData} subject='group' laboratoryTuple={laboratoryTuple} />
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