


# Senti #
senti is an attempt to sentiment analyze tweets. Curently it can handle User tweets and general searches.
Live version is available at http://senti.herokuapp.com/

## How it works##
Senti uses [sentiment](https://github.com/thisandagain/sentiment) for the analysis.
[connect-ratelimit](https://github.com/dharmafly/connect-ratelimit)  is used to limit the user requests.

## Installation##
Install nodejs from [here](http://nodejs.org/)

Clone Senti
<pre><code>git clone https://github.com/malithsen/senti.git
</code></pre>
Navigate to the cloned directory and run
<pre><code>npm install
</code></pre>
Rename config.sample.js to config.js and fill in the
credentials obtained from https://apps.twitter.com/app/new
Then run
<pre><code>npm start
</code></pre>

## To-Do##
* Use dynamic routing.
* ~~Show a summary of results on top of the page.~~
* Fix the bugs when highlighting keywords.
* Improve UI.
