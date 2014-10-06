import os
import webapp2
from google.appengine.api import users
import jinja2
import logging

jinja_environment = jinja2.Environment(autoescape=True,
    loader=jinja2.FileSystemLoader(os.path.join(os.path.dirname(__file__), 'templates')))

class MyHandler(webapp2.RequestHandler):
	"Setup self.user and self.templateValues values."
	def setupUser(self):
		self.user = users.get_current_user()
		self.templateValues = {}
		if self.user:
			self.templateValues['logout'] = users.create_logout_url('/')
			self.templateValues['username'] = self.user.nickname()
		else:
			self.templateValues['login'] = users.create_login_url('/')

	def render(self, afile):
		"Render the given file"
		template = jinja_environment.get_template(afile)
		self.response.out.write(template.render(self.templateValues))

class MainPageHandler(MyHandler):
	def get(self):
		self.setupUser()
		if self.user:
			self.templateValues['user'] = self.user
			self.templateValues['title'] = 'My Portal'
			self.redirect('/portal/')
		else:
			self.templateValues['title'] = 'ClassTrack'
			self.render('main.html')

class PortalPageHandler(MyHandler):
	def get(self):
		self.setupUser()
		if self.user:
			self.templateValues['user'] = self.user
			self.templateValues['title'] = 'My Portal'
			self.render('portal.html')
		else:
			self.templateValues['title'] = 'ClassTrack'
			self.redirect('/')

app = webapp2.WSGIApplication([('/portal/', PortalPageHandler),
							   ('/', MainPageHandler)],
                              debug=True)