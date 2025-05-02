# Scanning website

This is my the frontend of my thesis project, which is a supermarket barcode/QR code scanner designed to better shopping experiences. This is intended to be paired with the backend, which is also available at https://github.com/fcwe1113/scanning-website-backend

# How To Run

## WARNING: This frontend will not function without the backend running alongside with it, details of running the backend is in the backend repo at: https://github.com/fcwe1113/scanning-website-backend

## List of dependencies:
react

react-router-dom

@mui/material/CircularProgress

@mui/material/Box

react-toastify

react-qr-barcode-scanner

## Step by step setup
It is highly recommended you host the site properly with a web server like apache, however if you want to run it on your computer directly:

1. ensure you have npm installed, if not download it from here: https://nodejs.org/en/download/
2. ensure you have all the above dependencies installed, if not run the command ``` npm i package1 package2 ``` adding each package with their names separated with a whitespace, for example if you are running it on a fresh npm install the command would be ``` npm i react react-router-dom @mui/material/CircularProgress @mui/material/Box react-toastify react-qr-barcode-scanner ```
3. clone this repository into your chosen destination, or get Github Desktop (https://desktop.github.com/download/) to do it for you
4. if you hosted your backend then you most like have to change the URL of the backend then frontend is trying to connect to, you can do it in App.tsx in line 35, change the one that DOES NOT say localhost into your URL. Please note the backend server must have valid TLS certificates or the frontend will refuse to connect to it
5. navigate in a command prompt to where you cloned the repository into and run ``` npm run dev ```
6. npm should give you a localhost URL where you can then access the running page
7. assuming the backend is also running on your machine it should work properly

# Local only mode

As this site is built for mobile devices running it in localhost only mode is missing the point, but if you still choose to do so, just change the useCloud variable on line 34 of App.tsx to false and then tell npm to run it, assuming the backend is properly configured it should be able to run on localhost
