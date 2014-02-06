MetroViz
========
MetroViz: Visual Analysis of Public Transportation Data, Blacksburg, VA.

Demo Video
==========

An demo of the project is available here:

http://vimeo.com/81189035

Usage
=====
Running MetroViz requires python2 or python3 with cherrypy installed and the following database file (too large to be included directly in the git repo):

https://www.dropbox.com/s/tj05gb5d0mi8zuq/Metroviz.zip

git clone the project to obtain the source code and extract the Metroviz.db file in the root (MetroViz) directory.

To start MetroViz, execute webserver6.py (runs under python2 or python3) and *either* webserver2 or webserver3 (depending on your version of python). Then, point your browser at:

localhost:8000/app

To shutdown MetroViz, kill the two server processes.
