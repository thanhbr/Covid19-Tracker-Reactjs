import React, { useState, useEffect } from 'react';
import './App.css';
import { MenuItem,FormControl,Select, Card,CardContent } from '@material-ui/core'
import InfoBox from './Infor/InfoBox'
import Map from './Infor/Map';
import Table from './Infor/Table'
import { sortData, prettyPrintStat } from './util';
import LineGraph from './LineGraph/LineGraph';
import 'leaflet/dist/leaflet.css'

//DATA: https://disease.sh/v3/covid-19/countries 

function App() {
     const [countries, setCountries] = useState([]);
     const [country, setCountry] = useState('worldwide');
     const [countryInfo, setCountryInfo] = useState({});
     const [tableData, setTableData] = useState([]);
     const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng:  -40.4796 });
     const [mapZoom, setMapZoom] = useState(3);
     const [mapCountries, setMapCountries] = useState([]);
     const [casesType, setCasesType] = useState("cases");

     useEffect(() => {
          fetch("https://disease.sh/v3/covid-19/all")
               .then(reponse => reponse.json())
               .then(data => {
                    setCountryInfo(data);
               })
     }, []);

     useEffect(() =>{
          const getCountriesData = async () => {
               await fetch("https://disease.sh/v3/covid-19/countries")
                    .then((reponse) => reponse.json())
                    .then((data) =>{
                         const countries = data.map((country) => ({
                              name: country.country,
                              value: country.countryInfo.iso2
                         }));
                    const sortedData = sortData(data);
                    setTableData(sortedData);
                    setMapCountries(data);
                    setCountries(countries);
               });
          };
          getCountriesData();
     }, []);

     // 3 InfoBox
     const onCountryChange = async (event) => {
          const countryCode = event.target.value;
          // console.log("Country: >>>>>", countryCode);

          const url = countryCode === 'worldwide' 
               ? 'https://disease.sh/v3/covid-19/all' 
               : `https://disease.sh/v3/covid-19/countries/${countryCode}`;
          await fetch(url)
               .then(reponse => reponse.json())
               .then(data => {
                    setCountry(countryCode);
                    // All of the data
                    // from the country response
                    setCountryInfo(data);
                    setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
                    setMapZoom(4);
          });
     };

     // console.log('CountryInfo', countryInfo);

     return ( 
          <div className="app">
               <div className="app_left">
                    <div className="app_header">
                         <h1>COVID19 Tracker</h1>
                         <FormControl className="app_dropdown">
                              <Select variant="outlined" onChange={onCountryChange} value={country}>
                                   <MenuItem value="worldwide">Worldwide</MenuItem>
                                   {countries.map((country,index) =>(
                                        <MenuItem key={index} value={country.value}>{country.name}</MenuItem>
                                   ))}
                              </Select>
                         </FormControl>
                    </div>
                         
                    <div className="app_stats">
                         <InfoBox 
                              isRed
                              active = {casesType === "cases"}
                              onClick={e => setCasesType('cases')}
                              title='Coronavirus Cases' 
                              cases={prettyPrintStat(countryInfo.todayCases)} 
                              total={prettyPrintStat(countryInfo.cases)} 
                         />
                         <InfoBox
                              active = {casesType === "recovered"}
                              onClick={e => setCasesType('recovered')} 
                              title='Recovered' 
                              cases={prettyPrintStat(countryInfo.todayRecovered)} 
                              total={prettyPrintStat(countryInfo.recovered)} />
                         <InfoBox
                              isRed
                              active = {casesType === "deaths"}
                              onClick={e => setCasesType('deaths')} 
                              title='Deaths' 
                              cases={prettyPrintStat(countryInfo.todayDeaths)} 
                              total={prettyPrintStat(countryInfo.deaths)} />
                    </div>
 
                    <Map 
                         casesType={casesType}
                         countries={mapCountries}
                         center={mapCenter}
                         zoom={mapZoom}
                    />
               </div>
               
               <Card className="app_right">
                    <CardContent>
                         <h3>Live Cases by Country</h3>
                         <Table countries={ tableData } />
                         <h3>Worldwide new {casesType}</h3>
                         <LineGraph className="app_graph" casesType={casesType} />
                    </CardContent>
               </Card>
          </div>
     );
}

export default App;
