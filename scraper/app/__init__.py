#!/usr/bin/python3.7
from flask import Flask

app = Flask(__name__)

from app import routes

print(__name__)