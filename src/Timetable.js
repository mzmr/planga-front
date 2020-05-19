import React, { Component } from 'react';
import moment from 'moment';
import './Timetable.css';

const days = ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota', 'Niedziela'];

class Timetable extends Component {

    findFirstLesson(currentGroupLessons) {
        const lessonsWithStartValue = currentGroupLessons.map(lesson => {
            return {
                lesson: lesson,
                start: moment.duration(lesson.startTime).asMinutes()
        }});
        return lessonsWithStartValue.sort((lesson1, lesson2) => lesson1.start - lesson2.start)[0].lesson;
    }

    findLastLesson(currentGroupLessons) {
        const lessonsWithEndValue = currentGroupLessons.map(lesson => {
            return {
                lesson: lesson,
                end: moment.duration(lesson.startTime).asMinutes() 
                    + lesson.durationInTimeWindows * this.props.timetableData.timeWindowDurationInMinutes
        }});
        return lessonsWithEndValue.sort((lesson1, lesson2) => lesson2.end - lesson1.end)[0].lesson;
    }

    createTableHeader() {
        return (
            <thead>
                <tr>
                    <th className='hourColumn'></th>
                    <th className='separatorColumn'></th>
                    {
                        [...Array(this.props.timetableData.numberOfDaysInWeek).keys()]
                            .map(dayNumber => 
                                <th key={dayNumber}>
                                    {days[dayNumber]}
                                </th>
                            )
                    }
                </tr>
            </thead>
        );
    }

    createHourColumn(rowNumber, quarterInCurrentRow, firstHour) {
        const nextRowHour = firstHour.clone()
            .add((rowNumber + 1) * this.props.timetableData.timeWindowDurationInMinutes, 'minutes')
            .format('HH:mm');
        if (quarterInCurrentRow === 4) {
            return <td rowSpan='2' className='hourColumn cellWithHour'>{nextRowHour}</td>;
        }
        if ((quarterInCurrentRow === 1) && rowNumber > 0) {
            return null;
        }
        return <td className='hourColumn'></td>;
    }

    createDayColumn(dayNumber, currentGroupLessons, currentRowHour, quarterInCurrentRow) {
        const lessonsStartingInThisRow = currentGroupLessons
            .filter(lesson => (lesson.startTime === currentRowHour) && (lesson.dayNumber === dayNumber));
        if (lessonsStartingInThisRow.length > 0) {
            return (
                <td key={dayNumber} className='lesson' rowSpan={lessonsStartingInThisRow[0].durationInTimeWindows}>
                    Grupa {lessonsStartingInThisRow[0].groupId}, Nauczyciel {lessonsStartingInThisRow[0].teacherId}, Kurs {lessonsStartingInThisRow[0].courseId}
                </td>
            );
        }
        const lessonsWithEndHours = currentGroupLessons.map(lesson => {
            return {
                lesson: lesson,
                endHour: moment.utc(lesson.startTime, 'HH:mm')
                    .add(lesson.durationInTimeWindows * this.props.timetableData.timeWindowDurationInMinutes, 'minutes')
                    .format('HH:mm') 
            }
        });
        const lessonsLastingInThisRow = lessonsWithEndHours
            .filter(lesson => 
                (lesson.lesson.dayNumber === dayNumber) 
                && (lesson.endHour > currentRowHour) 
                && (lesson.lesson.startTime < currentRowHour));
        if (lessonsLastingInThisRow.length > 0) {
            return null; 
        }
        if (quarterInCurrentRow === 4) {
            return (<td key={dayNumber} className='fullHourBelow'></td>);
        } else if (quarterInCurrentRow === 2) {
            return (<td key={dayNumber} className='halfHourBelow'></td>);
        }
        return (<td key={dayNumber} className='quarterHourBelow'></td>);
    }

    createTableRow(rowNumber, firstHour, startingNumberOfQuarters, currentGroupLessons) {
        const currentRowHour = firstHour.clone()
            .add(rowNumber * this.props.timetableData.timeWindowDurationInMinutes, 'minutes')
            .format('HH:mm');
        const quarterInCurrentRow = (startingNumberOfQuarters + rowNumber) % 4 + 1;
        return (
            <tr key={rowNumber}>
                {this.createHourColumn(rowNumber, quarterInCurrentRow, firstHour)}
                <td className='separatorColumn'></td>
                {
                    [...Array(this.props.timetableData.numberOfDaysInWeek).keys()]
                        .map(dayNumber => this.createDayColumn(dayNumber, currentGroupLessons, currentRowHour, quarterInCurrentRow))
                }
            </tr>
        );
    }

    findEarliestHour(currentGroupLessons) {
        const firstLesson = this.findFirstLesson(currentGroupLessons);
        return moment
            .duration(firstLesson.startTime)
            .subtract(this.props.timetableData.timeWindowDurationInMinutes, 'minutes');
    }

    findLatestHour(currentGroupLessons) {
        const lastLesson = this.findLastLesson(currentGroupLessons);
        return moment
            .duration(lastLesson.startTime)
            .add(this.props.timetableData.timeWindowDurationInMinutes * (lastLesson.durationInTimeWindows + 1), 'minutes');
    }

    createTableBody() {
        const currentGroupLessons = this.props.timetableData.lessons.filter(lesson => lesson.groupId === this.props.subjectId);
        const earliestTime = this.findEarliestHour(currentGroupLessons);
        const latestTime = this.findLatestHour(currentGroupLessons);
        const numberOfTableRows = (latestTime.asMinutes() - earliestTime.asMinutes()) / this.props.timetableData.timeWindowDurationInMinutes;
        const firstHour = moment.utc(earliestTime.asMilliseconds());
        const startingNumberOfQuarters = earliestTime.asMinutes() / 15;
        return (
            <tbody>
                {
                    [...Array(numberOfTableRows).keys()]
                        .map(rowNumber => this.createTableRow(rowNumber, firstHour, startingNumberOfQuarters, currentGroupLessons))
                }
            </tbody>
        );
    }

    render() {
        return (
            <table>
                {this.createTableHeader()}
                {this.createTableBody()}
            </table>
        );
    }
}
  
export default Timetable;