import React, { Component } from 'react';
import { Container } from 'reactstrap';
import moment from 'moment';
import './Home.css';

const days = ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota', 'Niedziela'];

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

    findFirstLesson(currentGroupLessons, windowDurationInMinutes) {
        const lessonsWithStartValue = currentGroupLessons.map(lesson => {
            return {
                lesson: lesson,
                start: moment.duration(lesson.startTime).asMinutes()
        }});
        return lessonsWithStartValue.sort((lesson1, lesson2) => lesson1.start - lesson2.start)[0].lesson;
    }

    findLastLesson(currentGroupLessons, windowDurationInMinutes) {
        const lessonsWithEndValue = currentGroupLessons.map(lesson => {
            return {
                lesson: lesson,
                end: moment.duration(lesson.startTime).asMinutes() + lesson.durationInTimeWindows * windowDurationInMinutes
        }});
        return lessonsWithEndValue.sort((lesson1, lesson2) => lesson2.end - lesson1.end)[0].lesson;
    }

    render() {
        if (this.state.timetableData === null) {
            return 'Loading...';
        }
        const dayNumbers = [...Array(this.state.timetableData.numberOfDaysInWeek).keys()];
        const currentGroupId = 3;
        const currentGroupLessons = this.state.timetableData.lessons.filter(lesson => lesson.groupId === currentGroupId);
     
        const windowDurationInMinutes = this.state.timetableData.timeWindowDurationInMinutes;

        const firstLesson = this.findFirstLesson(currentGroupLessons, windowDurationInMinutes);
        const lastLesson = this.findLastLesson(currentGroupLessons, windowDurationInMinutes);
        const earliestTime = moment.duration(firstLesson.startTime).subtract(windowDurationInMinutes, 'minutes');
        const latestTime = moment.duration(lastLesson.startTime).add(windowDurationInMinutes * (lastLesson.durationInTimeWindows + 1), 'minutes');
        const numberOfTableRows = (latestTime.asMinutes()  - earliestTime.asMinutes()) / windowDurationInMinutes;
        const rowNumbers = [...Array(numberOfTableRows).keys()];

        const firstHour = moment.utc(earliestTime.asMilliseconds());
        const startingNumberOfQuarters = earliestTime.asMinutes() / 15;

        // console.log('earliestTime:');
        // console.log(earliestTime);
        // console.log('earliestLesson:');
        // console.log(earliestLesson);
        // console.log('latestTime:');
        // console.log(latestTime);
        // console.log('latestLesson:');
        // console.log(lastLesson);

        return (
            <Container>
                <table>
                    <thead>
                        <tr>
                            <th className='hourColumn'></th>
                            <th className='separatorColumn'></th>
                            {
                                dayNumbers.map(dayNumber => <th key={dayNumber}>{days[dayNumber]}</th>)
                            }
                        </tr>
                    </thead>
                    <tbody>
                        {
                            rowNumbers.map(rowNumber =>  {
                                const nextRowHour = firstHour.clone().add((rowNumber + 1) * windowDurationInMinutes, 'minutes').format('HH:mm');
                                const currentRowHour = firstHour.clone().add(rowNumber * windowDurationInMinutes, 'minutes').format('HH:mm');
                                return (<tr key={rowNumber}>
                                    {
                                        ((startingNumberOfQuarters + rowNumber) % 4 === 3) 
                                            ? <td rowSpan='2' className='hourColumn cellWithHour'>{nextRowHour}</td> 
                                            : (((startingNumberOfQuarters + rowNumber) % 4 === 0) && rowNumber !== 0)
                                            ? null
                                            : <td className='hourColumn'></td>
                                    }
                                    <td className='separatorColumn'></td>
                                    {
                                        dayNumbers.map(dayNumber => {
                                            const lessonsStartingInThisRow = currentGroupLessons
                                                .filter(lesson => (lesson.startTime === currentRowHour) && (lesson.dayNumber === dayNumber));
                                            if (lessonsStartingInThisRow.length > 0) {
                                                return (<td key={dayNumber} className='lesson' rowSpan={lessonsStartingInThisRow[0].durationInTimeWindows}>
                                                    Grupa {lessonsStartingInThisRow[0].groupId}, Nauczyciel {lessonsStartingInThisRow[0].teacherId}, Kurs {lessonsStartingInThisRow[0].courseId}
                                                </td>);
                                            }
                                            const lessonsWithEndHours = currentGroupLessons.map(lesson => {
                                                return {
                                                    lesson: lesson,
                                                    endHour: moment.utc(lesson.startTime, 'HH:mm')
                                                        .add(lesson.durationInTimeWindows * windowDurationInMinutes, 'minutes')
                                                        .format('HH:mm') 
                                                }
                                            });
                                            const lessonsLastingInThisRow = lessonsWithEndHours
                                                .filter(lesson => (lesson.lesson.dayNumber === dayNumber) && (lesson.endHour > currentRowHour) && (lesson.lesson.startTime < currentRowHour));
                                            if (lessonsLastingInThisRow.length > 0) {
                                                return null; 
                                            }
                                            const rowDeterminer = (startingNumberOfQuarters + rowNumber) % 4;
                                            if (rowDeterminer === 3) {
                                                return (<td key={dayNumber} className='fullHourBelow'></td>);
                                            } else if (rowDeterminer === 1) {
                                                return (<td key={dayNumber} className='halfHourBelow'></td>);
                                            }
                                            return (<td key={dayNumber} className='quarterHourBelow'></td>);
                                        })
                                    }
                                </tr>);
                            })
                        }
                    </tbody>
                </table>
            </Container>
        );
    }
}
  
export default Home;