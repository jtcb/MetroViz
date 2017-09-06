MetroViz
========
MetroViz: Visual Analysis of Public Transportation Data, Blacksburg, VA.

Demo Video
==========

An demo of the project is available here:

http://vimeo.com/81189035

Usage
=====
Running MetroViz requires python2 or python3 with cherrypy installed and the Metroviz.db data file (extract the split archive from data.zip and data.z01)

git clone the project to obtain the source code and extract the Metroviz.db file in the root (MetroViz) directory.

To start MetroViz, execute webserver6.py (runs under python2 or python3) and *either* webserver2 or webserver3 (depending on your version of python). Then, point your browser at:

localhost:8000/app

To shutdown MetroViz, kill the two server processes.
