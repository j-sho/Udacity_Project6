# Neighborhood Map

This application uses the Google Maps javascript API to render a map, along with markers, indicating popular places to visit in Berlin. Using Foursquare, a third party API, additional venue information is returned when the user clicks on a venue.
[Knockout](http://knockoutjs.com/documentation/introduction.html) is implemented to automatically update the user interface when a search feature is used.

### Live Demo 

- [Visit this link](https://udacity-maps-project-172920.appspot.com/)

### Installation

Please obtain a standard one for free on your own website. Directions for obtaining an API Key can be found [here](https://developers.google.com/maps/documentation/javascript/get-api-key). Replace the existing key with your own at the bottom of the index.html file: ...../js?key=YOUR KEY....

When using the Foursquare API, please obtain your own Client ID and Client Secret at Foursquare by creating an App which involves filling out a few simple fields, you could find more detailed information [here](https://developer.foursquare.com/overview/auth). Again, replace your own ID and Secret with the existing ones inside the app.js file. 

### How to Run

1. Make sure you have [Google app engine](https://cloud.google.com/appengine/downloads) installed
2. Clone the repository
3. cd into folder
4. Spin up the server command `dev_appserver.py app.yaml`
5. Go to your browser and type http://localhost:8080
6. Or you could try run the app, simply open up the `templates/index.html` file inside your browser.

### Usefull links to documentation

- [KnockoutJS Documentation](http://knockoutjs.com/documentation/introduction.html)
- [Google Maps API Documentation](https://developers.google.com/maps/documentation/javascript/tutorial)
- [Foursquare API Documentation](https://developer.foursquare.com/docs/)

### Details

- If you click markers: You could choose either to see or hide all locations, or see locations by category.
- By clicking on items from location list or on marker of places, you could see an info window with this data: name, address, number, rating via Foursquare and link to the web site.
- Markers differs by colors for each category.
- You could search other places in the search box.
