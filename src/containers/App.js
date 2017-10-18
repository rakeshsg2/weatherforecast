import React from 'react'
import {Container, Row, Col} from 'react-grid-system'
import axios from 'axios'
import WeatherReport from '../components/WeatherReport'

export default class App extends React.Component {
	constructor() {
		super()
		this.appId ='92d7508ae3e2a43dc07cb1c28e5a3a7c'
		this.apiURL = 'http://api.openweathermap.org/data/2.5/forecast?units=metric&'
		this.state = {
			data: null
		}
		this.placeChangedCallback = this.placeChangedCallback.bind(this)
	}
	componentDidMount() {
	    this.places = new google.maps.places.Autocomplete(this.locationSearchField);
	    google.maps.event.addListener(this.places, 'place_changed', this.placeChangedCallback);
	}
	placeChangedCallback() {
        let place = this.places.getPlace()
        console.log(JSON.stringify({
        	lat : place.geometry.location.lat(),
        	lon : place.geometry.location.lng()
        }))
       this.getWeatherReportJson(place.geometry.location.lat(), place.geometry.location.lng())

	}
	getWeatherReportJson(lat, lon) {
		if(lat === null || lon === null)
			return
		let wURL = `${this.apiURL}lat=${lat}&lon=${lon}&mode=json&appid=${this.appId}`
		let self = this;
		let cards = null
		axios.get(wURL)
			.then(function (response) {
				self.getDataAsPerCurrentTimeSlot(response.data.list)		    			    	
		  	})
		  	.catch(function (error) {
		    	console.log(error)
			})
	}
	formatDate(dateTxt) {
		const monthNames = ["January", "February", "March", 
							"April", "May", "June", "July", 
							"August", "September", "October", 
							"November", "December"
							]
		let date = dateTxt.split(' ')[0].split('-')
		return `${date[2]} ${monthNames[date[1]]}`
	}
	formatTimeHour(dateTxt) {
		return parseInt(dateTxt.split(' ')[1].split(':')[0])
	}
	getDataAsPerCurrentTimeSlot(data) {
		/* API returns forecast for entire day in 3 hours sets. For simplicity we are 
           only displaying forecast from the current local system time.
		 */
		let d = new Date()
		let cHours = d.getHours()
		let timeSlot = ''
		if(cHours>= 0 && cHours<3) {
			timeSlot = '00:00:00'
		} else if(cHours>= 3 && cHours<6) {
			timeSlot = '03:00:00'
		}
		else if(cHours>= 6 && cHours<9) {
			timeSlot = '06:00:00'
		}
		else if(cHours>= 9 && cHours<12) {
			timeSlot = '09:00:00'
		}
		else if(cHours>= 12 && cHours<15) {
			timeSlot = '12:00:00'
		}
		else if(cHours>= 15 && cHours<18) {
			timeSlot = '15:00:00'
		}
		else if(cHours>= 18 && cHours<21) {
			timeSlot = '18:00:00'
		}
		else if(cHours>= 21) {
			timeSlot = '21:00:00'
		}

		let json = data.filter( c => {
			let time = c.dt_txt.split(' ')[1]
			if(time === timeSlot)
				return c
		})
		
		this.setState( { data: json })
	}
	render() {
		let cards = ''
		let id = 1
		if(this.state.data) {
			cards = this.state.data.map( c => {				
				return <WeatherReport key={id++} timeHour={this.formatTimeHour(c.dt_txt)} date={this.formatDate(c.dt_txt)} maxTemp={c.main.temp_max} minTemp={c.main.temp_min} humidity={c.main.humidity} description={c.weather[0].description} />
			})
		}
		return(
			<Container>
			  <Row>
			    <Col lg={12}>
			    	<Row>
				    	<h4>Weather forecast App</h4>
					</Row>
			    </Col>
			  </Row>
			  <Row>
			    <Col lg={12}>
			    	<input type="text" ref={(input) => { this.locationSearchField = input; }} placeholder="Enter a location to get weather forecast at current local time" />
			    </Col>
			  </Row>
			  <Row>
			    <Col lg={12}>
			    	<Row>
				    	{cards}
					</Row>
			    </Col>
			  </Row>
			</Container>
		)
	}
}
