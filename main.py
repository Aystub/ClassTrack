import os
import webapp2
from google.appengine.ext import ndb
from google.appengine.api import users
import jinja2
import logging
import datetime
from datetime import datetime
import models
import json
import re
import time
from google.appengine.api import mail

from webapp2_extras import auth
from webapp2_extras import sessions

from webapp2_extras.auth import InvalidAuthIdError
from webapp2_extras.auth import InvalidPasswordError
from google.appengine.api import channel


jinja_environment = jinja2.Environment(autoescape=True,
    loader=jinja2.FileSystemLoader(os.path.join(os.path.dirname(__file__), 'templates')))

#CONSTANTS for user type
admin_user = 0   #user is a admin
teacher_user = 1 #user is a teacher
parent_user = 2  #user is a parent
student_user = 3 #user is a student
#END CONSTANTS

# No longer in use because of Node.JS, however, storing for 10 future commits
# starts 3-7-15
# def maybe_add_constraint(constraints, param, constraint):
#     if (param.lower() == 'true'):
#         constraints['optional'].append({constraint: True})
#     elif (param.lower() == 'false'):
#         constraints['optional'].append({constraint: False})
#     return constraints

# def make_pc_constraints(dtls, dscp, ipv6):
#     constraints = { 'optional': [] }
#     maybe_add_constraint(constraints, dtls, 'DtlsSrtpKeyAgreement')
#     maybe_add_constraint(constraints, dscp, 'googDscp')
#     maybe_add_constraint(constraints, ipv6, 'googIPv6')

# def get_preferred_audio_send_codec(user_agent):
#     # Empty string means no preference.
#     preferred_audio_send_codec = ''
#     # Prefer to send ISAC on Chrome for Android.
#     if 'Android' in user_agent and 'Chrome' in user_agent:
#         preferred_audio_send_codec = 'ISAC/16000'
#     return preferred_audio_send_codec

# def get_preferred_audio_receive_codec():
#     return 'opus/48000'

#JSON Serialization issues
def default(obj):
    """Default JSON serializer."""
    import calendar, datetime

    millis = 0
    if isinstance(obj, datetime.datetime):
        if obj.utcoffset() is not None:
            obj = obj - obj.utcoffset()
        millis = int(
        calendar.timegm(obj.timetuple()) * 1000 +
        obj.microsecond / 1000
    )
    return millis

def user_required(handler):
    """Decorator that checks if there's a user associated with the current session.
    Will also fail if there's no session present.
    """
    def check_login(self, *args, **kwargs):
        auth = self.auth
        if not auth.get_user_by_session():
            self.redirect(self.render('login.html'), abort=True)
        else:
            return handler(self, *args, **kwargs)

class MyHandler(webapp2.RequestHandler):
    "Setup self.user and self.templateValues values."
    # def setupUser(self):
    #     """Returns the implementation of the user model.
    #        It is consistent with config['webapp2_extras.auth']['user_model'], if set.
    #     """
    #     self.user_exists = self.auth.get_user_by_session()
    #     self.templateValues = {}
    #     if self.user_exists:
    #         children_name_list = []
    #         self.templateValues['logout'] = '/logout'
    #         self.templateValues['first_name'] = self.user_model.get_by_id(self.user_info['user_id']).first_name
    #         self.templateValues['username'] = self.user_info['auth_ids'][0]
    #         self.templateValues['usertype'] = self.user_model.get_by_id(self.user_info['user_id']).user_type
    #         self.templateValues['id'] = self.user_info['user_id']

    #         #Children
    #         children_ids = self.user.children
    #         if not children_ids[0] == "None": #list is not empty
    #             children_query = models.User.query(models.User.auth_ids.IN(children_ids))
    #             self.templateValues['children_list'] = children_query

    #         #Course
    #         courseList = ['Math', 'PE', 'Geography', 'English'] # These need to go to the class select handler
    #         self.templateValues['selected_class'] = courseList[len(courseList)-1]
    #     else:
    #         self.templateValues['login'] = '/login'
    #         self.templateValues['signup'] = '/signup'

    def setupUser(self):
        """Returns the implementation of the user model.
           It is consistent with config['webapp2_extras.auth']['user_model'], if set.
        """
        self.user_exists = self.auth.get_user_by_session()
        self.templateValues = {}
        if self.user_exists:
            children_name_list = []
            self.templateValues['logout'] = '/logout'
            self.templateValues['first_name'] = self.user.first_name
            self.templateValues['last_name'] = self.user.last_name
            self.templateValues['username'] = self.user_info['auth_ids'][0]
            self.templateValues['school'] = self.user.school

            userType = self.user.user_type
            self.templateValues['usertype'] = userType

            userTypeString = ''
            if userType == 0:
                userTypeString = 'Admin'
            if userType == 1:
                userTypeString = 'Teacher'
            if userType == 2:
                userTypeString = 'Parent'
            self.templateValues['usertypeAsString'] = userTypeString

            if self.user.school:
                self.templateValues['primaryColor'] = models.School.query(ancestor=self.user.school[0]).fetch()[0].primary_color
                self.templateValues['secondaryColor'] = models.School.query(ancestor=self.user.school[0]).fetch()[0].secondary_color

            #Children
            children_ids = self.user.family
            if children_ids: #list is not empty
                children_query = models.User.query(models.User.key.IN(children_ids))
                self.templateValues['children_list'] = children_query

            #Course
            courseList = ['Math', 'PE', 'Geography', 'English'] # These need to go to the class select handler
            self.templateValues['selected_class'] = courseList[len(courseList)-1]
        else:
            self.templateValues['login'] = '/login'
            self.templateValues['signup'] = '/signup'


    def render(self, afile):
        """Render the given file"""
        template = jinja_environment.get_template(afile)
        self.response.out.write(template.render(self.templateValues))

    def navbarSetup(self):
        self.templateValues['index'] = '/'
        self.templateValues['title'] = 'Class Track'
        self.templateValues['login'] = '/login'
        self.templateValues['signup'] = '/signup'

    @webapp2.cached_property
    def auth(self):
        """Shortcut to access the auth instance as a property."""
        return auth.get_auth()

    @webapp2.cached_property
    def user_info(self):
        """Shortcut to access a subset of the user attributes that are stored
        in the session.

        The list of attributes to store in the session is specified in
          config['webapp2_extras.auth']['user_attributes'].
        :returns
          A dictionary with most user information
        """
        return self.auth.get_user_by_session()

    @webapp2.cached_property
    def user(self):
        """Shortcut to access the current logged in user.

        Unlike user_info, it fetches information from the persistence layer and
        returns an instance of the underlying model.

        :returns
          The instance of the user model associated to the logged in user.
        """
        u = self.user_info
        return self.user_model.get_by_id(u['user_id']) if u else None

    @webapp2.cached_property
    def user_model(self):
        """Returns the implementation of the user model.

        It is consistent with config['webapp2_extras.auth']['user_model'], if set.
        """
        return self.auth.store.user_model

    @webapp2.cached_property
    def session(self):
        """Shortcut to access the current session."""
        return self.session_store.get_session(backend="datastore")

    # this is needed for webapp2 sessions to work
    def dispatch(self):
        # Get a session store for this request.
        self.session_store = sessions.get_store(request=self.request)

        try:
            # Dispatch the request.
            webapp2.RequestHandler.dispatch(self)
        finally:
            # Save all sessions.
            self.session_store.save_sessions(self.response)

    def display_message(self, message):
        """Utility function to display a template with a simple message."""
        self.templateValues = {}
        self.navbarSetup()
        self.templateValues['message'] = message
        self.render('message.html')

    def login_check(self):
        if not self.user_info:
            self.redirect('index.html')


class MainPageHandler(MyHandler):
    def get(self):
        self.setupUser()
        self.navbarSetup()
        if self.user_info:
            self.templateValues['user'] = self.user_info
            self.templateValues['username'] = self.user_info['auth_ids'][0]
            self.templateValues['post'] = '/post'
            self.redirect('/home')
        else:
            self.templateValues['login'] = "/login"
            self.templateValues['signup'] = "/signup"
            self.render('index.html')

class NotFoundPageHandler(MyHandler):
    def get(self):
        self.render('404.html')

class PostPageHandler(MyHandler):
    def get(self):
        self.render('post.html')

class SchoolNameHandler(MyHandler):
    def post(self):
        school_query = models.School.query().fetch()
        self.response.out.write(json.dumps([p.to_dict() for p in school_query]))

class SignupPageHandler(MyHandler):
    def get(self):
        self.templateValues = {}
        self.navbarSetup()
        self.templateValues['title'] = "Sign Up"
        self.render('signup.html')

    def post(self):
        self.templateValues = {}
        password = self.request.get('password')
        email = self.request.get('email')
        first_name = self.request.get('fname')
        last_name = self.request.get('lname')
        teacher_code = self.request.get('teacher_code')
        student_id = self.request.get('student_id')
        parent_id = self.request.get('parent_id')
        school_name = self.request.get('school')
        verified = False

        child = []
        courseList = []
        meeting = []
        messageThread = []

        requested_school = models.School.query(models.School.name == school_name).fetch(1, keys_only = True)
        # Check if valid school
        if len(requested_school) == 0 or requested_school is None:
            self.templateValues['error'] = 'We were unable to find your school. Please ensure that you have entered the school name properly. If you continue to have issues, please check with your school administrator to see if your school is registered in our system.'
            if teacher_code:
                self.render('teacherRegistration.html')
            elif student_id or student_id == '' and not parent_id:
                self.render('childRegistration.html')
            else:
                self.render('signup.html')
            return

        if teacher_code:
            user_type = teacher_user
            class_name_indexes = json.loads(self.request.get('class-indexes')) # for classes
            courseList = []
            for index in class_name_indexes:
                prefix = "name-"
                request_code = prefix + str(index)
                class_name = self.request.get(request_code)
                # Check if name is invalid
                if class_name != '':
                    new_class = models.Course(
                        school = requested_school[0],
                        name = class_name
                    )
                    new_class_key = new_class.put()
                    courseList.append(new_class_key)


        elif student_id:
            user_type = student_user
            verified = True
            email = student_id #Make student_id the auth_id for students
        else:
            user_type = parent_user

        user_data = self.user_model.create_user(email,
            first_name=first_name,
            password_raw=password,
            last_name=last_name,
            user_type=user_type,
            family=[],
            verified=verified,
            courseList=courseList,
            meetings=meeting,
            messageThreads=messageThread,
            school = requested_school)

        # Check if duplicate entry for email
        if not user_data[0]: #user_data is a tuple (boolean, info). Boolean denotes success
            self.templateValues['error'] = 'Unable to create account for the email address %s because an account for this email address already exists. Please try another email.' % (email)
            self.render('teacherRegistration.html')
            # We need to retroactively delete the classes that were just created
            # This could possibly work better if we queried if a email exists earlier
            # But we're currently relying on WebApp2 authentication to determine uniqueness
            # by creating first and then checking
            for entry in courseList:
                entry.delete()
            return
        else:
            if teacher_code:
                new_teacher = user_data[1].key
                schoolObj = requested_school[0].get()
                schoolObj.put()
                for class_entry in courseList:
                    schoolObj.classes.append(class_entry)
                    classObj = class_entry.get()
                    classObj.teacher.append(new_teacher)
                    classObj.put()
                schoolObj.put()

        if not student_id:
            user = user_data[1]
            user_id = user.get_id()

            token = self.user_model.create_signup_token(user_id)

            verification_url = self.uri_for('verification', type='v', user_id=user_id, signup_token=token, _full=True)

            sender_address="classtracknoreply@gmail.com"
            subject="Welcome to Classtrack! Please Verify Your Email."
            user_address = email
            body = """
            Dear {name}:

            Thank you for signing up with ClassTrack! Before we can continue, we need you to verify your account with us.

            Please verify your email by clicking the following link:
            {link}

            Thanks!
            Team Classtrack
            """.format(name=first_name, link=verification_url)

            mail.send_mail(sender_address, user_address, subject, body)

            msg = 'A verification email has been sent to {email_confirmation}'
            self.display_message(msg.format(email_confirmation=email))
        else:
            self.redirect('/childRegistration')

class VerificationHandler(MyHandler):
    def get(self, *args, **kwargs):
        user = None
        user_id = kwargs['user_id']
        signup_token = kwargs['signup_token']
        verification_type = kwargs['type']
        user, ts = self.user_model.get_by_auth_token(int(user_id), signup_token,'signup')

        if not user:
            logging.info('Could not find any user with id "%s" signup token "%s"', user_id, signup_token)
            self.abort(404)

        # store user data in the session
        self.auth.set_session(self.auth.store.user_to_dict(user), remember=True)

        if verification_type == 'v':
            # remove signup token to prevent users from coming back with an old link
            self.user_model.delete_signup_token(user.get_id(), signup_token)

            if not user.verified:
                user.verified = True
                #Need to reassign user.auth_ids to avoid a JSON serialization error that
                #was constantly occuring.
                user.auth_ids = [user.auth_ids[0]]
                user.put()

            self.display_message('Your email address has been verified.')
            return

        elif verification_type == 'p':
            # supply user to the page
            self.setupUser()
            self.templateValues['user'] = user
            self.templateValues['token'] = signup_token
            self.render('resetpassword.html')
        else:
            logging.info('verification type not supported')
            self.abort(404)

class HomePageHandler(MyHandler):
    def get(self):
        self.setupUser()
        filter_list = ['School News', 'PTA', 'Grades', 'Assignment', 'Events']
        newsfeed_list = ['LHS went 41-27 against CHS!','Sarah made an 87 on her English-Chapter 5 Test','PTA is holding a meeting on 12/5/14', 'Flu shots will be given 11/19/14','LHS went 41-27 against CHS!','Sarah made an 87 on her English-Chapter 5 Test','PTA is holding a meeting on 12/5/14', 'Flu shots will be given 11/19/14', 'LHS went 41-27 against CHS!','Sarah made an 87 on her English-Chapter 5 Test','PTA is holding a meeting on 12/5/14', 'Flu shots will be given 11/19/14','LHS went 41-27 against CHS!','Sarah made an 87 on her English-Chapter 5 Test','PTA is holding a meeting on 12/5/14', 'LAST ELEMENT']
        self.templateValues['user'] = self.user
        self.templateValues['title'] = 'Home'
        self.templateValues['filter_list'] = filter_list
        logging.info("LENGTH OF FAMILY: %s", len(self.user.family))
        if self.user.user_type == 1:
            self.templateValues['planConferenceLink'] = 'selectCourseMenu'
        elif self.user.user_type == 2:
            self.templateValues['planConferenceLink'] = 'selectChildMenu'
        if len(self.user.family) == 0:
            self.templateValues['warning'] = "You have not added a child to your account yet. To get the most out of ClassTrack you should link yourself to your child's account "

        if len(self.user.meetings) > 0:
            self.templateValues['numConf'] = len(self.user.meetings)
        else:
            self.templateValues['numConf'] = 0

        if len(self.user.messages) > 0:
            self.templateValues['numMess'] = len(self.user.messages)
        else:
            self.templateValues['numMess'] = 0

        # qry = models.NFPost.query().order(-models.NFPost.time).fetch()
        # self.templateValues['newsfeed_list'] = qry
        self.login_check()
        # self.render('home.html')
        self.render('circleHome.html')


class SetPasswordHandler(MyHandler):
    def get(self):
        self.redirect('/')

    def post(self):
        user = self.request.get('u')

        if not user:
            self.redirect('/login')

        password = self.request.get('password')

        old_token = self.request.get('t')

        if not password or password != self.request.get('confirm_password'):
            self.display_message('passwords do not match')
            return

        user = self.user
        user.set_password(password)
        user.put()

        # remove signup token, we don't want users to come back with an old link
        self.user_model.delete_signup_token(user.get_id(), old_token)

        self.display_message('Password updated')

class ForgotPasswordHandler(MyHandler):
    def get(self):
        self.setupUser()
        self.render('forgot.html')

    def post(self):
        self.setupUser()
        username = self.request.get('email')

        user = self.user_model.get_by_auth_id(username)
        if not user:
            logging.info('Could not find any user entry for username %s', username)
            self.templateValues['error'] = 'Sorry, we could not find an account matching ' + username
            self.render('forgot.html')
            return

        user_id = user.id()
        token = self.user_model.create_signup_token(user_id)

        verification_url = self.uri_for('verification', type='p', user_id=user_id, signup_token=token, _full=True)

        sender_address="classtracknoreply@gmail.com"
        subject="Password Reset Request From Classtrack"
        user_address = username
        body = """
        Dear {name}:

        Thank you for signing up with ClassTrack! Before we can continue, we need you to verify your account with us.

        Please verify your email by clicking the following link:
        {link}

        Thanks!
        Team Classtrack
        """.format(name=user.first_name, link=verification_url)

        mail.send_mail(sender_address, user_address, subject, body)
        msg = 'Send an email to user in order to reset their password. They will be able to do so by visiting <a href="{url}">{url}</a>'

        self.display_message(msg.format(url=verification_url))

class LoginPageHandler(MyHandler):
    def get(self):
        self.templateValues = {}
        self.navbarSetup()
        self.templateValues['title'] = "Login"
        self.render('login.html')

    def post(self):
        email = self.request.get('email') #Get username value from html
        password = self.request.get('password') #Get password value from html
        try:
            u = self.auth.get_user_by_password(email, password, remember=True, save_session=True)
            this_user = self.user

            if this_user.family == []:
                self.redirect('/addChild')
            else:
                self.redirect('/')
        except (InvalidAuthIdError, InvalidPasswordError) as e:
            logging.info('Login failed for user %s because of %s', email, type(e))
            self.templateValues = {}
            self.navbarSetup()
            self.templateValues['title'] = "Login"
            self.templateValues['error'] = "Invalid Username or Password."
            self.render('login.html')

class LogoutPageHandler(MyHandler):
    def get(self):
        self.auth.unset_session()
        self.redirect('/')

class AuthenticatedHandler(MyHandler):
    @user_required
    def get(self):
        self.render('authenticated.html')

class jqueryPostHandler(MyHandler):
    def get(self):
        self.redirect('/')

    def post(self):
        ids = self.request.get('IDValues')
        data = json.loads(ids)
        #classIds = data["classIds"]
        typeIds = data['typeIds']
        if not typeIds:
            self.response.out.write(json.dumps(["No Filters Selected"]))
        else:
            typeIds = list(map(int, typeIds))
            #typeIds = [0,1,2,3]
            #schoolIds = data["schoolIds"]
            qry = models.NFPost.query(models.NFPost.typeID.IN(typeIds)).order(-models.NFPost.time)
            self.response.out.write(json.dumps([p.caption for p in qry]))
            #self.response.out.write(json.dumps(typeIds))

class PostHandler(MyHandler):
    def get(self):
        self.redirect('/')

    def post(self):
        the_post = self.request.get('the_post')
        owner = str(self.user_info['auth_ids'][0])
        postClass = self.request.get('classid')

        thePost = models.NFPost(caption=the_post, owner=owner, classID=postClass)

        future = thePost.put()

class PrivateMessageHandler(MyHandler):
    def get(self):
        self.redirect('/')

    def post(self):
        the_message = self.request.get('the_message')
        the_sender = str(self.user_info['auth_ids'][0])
        the_thread = self.request.get('messageThread')

        theMessage = models.PrivateMessage(sender=the_sender, messageThread=the_thread, message=the_message)

        future = theMessage.put()

class AboutPageHandler(MyHandler):
    def get(self):
        self.setupUser()
        self.navbarSetup()
        if self.user:
            self.templateValues['user'] = self.user
        self.templateValues['title'] = 'ClassTrack'
        self.render('about.html')

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

class ContactPageHandler(MyHandler):
	def get(self):
		self.setupUser()
		self.navbarSetup()
		self.templateValues['user'] = self.user()
		self.templateValues['title'] = 'ClassTrack'
		self.render('contact.html')

class NotFoundPageHandler(MyHandler):
	def get(self):
		self.setupUser()
		self.navbarSetup()
		self.templateValues['user'] = self.user
		self.templateValues['title'] = 'ClassTrack'
		self.render('404.html')

class CalendarPageHandler(MyHandler):
    def get(self):
        self.setupUser()
        self.navbarSetup()
        self.templateValues['user'] = self.user
        self.templateValues['title'] = 'Calendar | ClassTrack'
        self.login_check()
        conferences = []

        if(self.user.meetings):
            conference_list = models.Conference.query(models.Conference.key.IN(self.user.meetings))
            for conf in conference_list:
                data = {}
                names = ''
                data['title'] = conf.names_list + "\n" + conf.purpose
                data['start'] = conf.datetime.strftime("%Y-%m-%d")
                conferences.append(data)
        # data['title'] = 'daniel'
        # data['start'] = "2015-04-07"
        # conferences.append(data)
        self.templateValues['conferences'] = json.dumps(conferences)
        self.render('calendar.html')

class GradesPageHandler(MyHandler):
    def get(self):
        self.setupUser()
        self.navbarSetup()
        self.templateValues['user'] = self.user
        self.templateValues['title'] = 'Grades | ClassTrack'
        self.login_check()
        self.render('grades.html')

class DocumentsPageHandler(MyHandler):
    def get(self):
        self.setupUser()
        self.navbarSetup()
        self.templateValues['user'] = self.user
        self.templateValues['title'] = 'Documents | ClassTrack'
        self.login_check()
        self.render('documents.html')

class ConferenceSchedulerPageHandler(MyHandler):
    def get(self):
        self.setupUser()
        self.navbarSetup()
        #conference_list = conference_query.filter(self.user_info['user_id'] == models.Conference.participant_ids)
        user1 = self.user
        conference_list = []
        part_list = []
        if(user1.meetings):
            conference_list = models.Conference.query(models.Conference.key.IN(user1.meetings))
            for conf in conference_list:
                names=''
                #replace with name string
                small_list = conf.participants
                for index, part in enumerate(small_list):
                    person_query = models.User.query().filter(models.User.auth_ids==part)
                    person = [person.to_dict() for person in person_query]
                    names += person[0]['first_name'] + " "
                    names += person[0]['last_name']
                    if(len(small_list) != 1 & index != len(small_list) - 1):
                        names += ', '
                part_list.append(names)

        invite_list = []
        small_list_inv = []
        part_list_inv = []
        if(user1.invited):
            invite_list = models.Conference.query(models.Conference.key.IN(user1.invited))
            for conf in invite_list:
                names=''
                #replace with name string
                small_list_inv = conf.participants
                for part in small_list_inv:
                    person_query = models.User.query().filter(models.User.auth_ids==part)
                    person = [person.to_dict() for person in person_query]
                    names += person[0]['first_name'] + " "
                    names += person[0]['last_name']
                    names += ', '
                part_list_inv.append(names)
        self.templateValues['user'] = self.user
        self.templateValues['title'] = 'Schedule a Conference | ClassTrack'
        self.templateValues['conference_list'] = conference_list
        self.templateValues['conference_list_inv'] = invite_list
        self.templateValues['part_list'] = part_list
        self.templateValues['part_list_inv'] = part_list_inv
        self.login_check()
        self.render('conferenceSchedule.html')

#class acceptConference(MyHandler):
    # def get(self):
    #     self.setupUser()
    #     self.navbarSetup()
    #     self.templateValues['user'] = self.user
    #     self.templateValues['title'] = 'Grades | ClassTrack'
    #     self.login_check()
    #     self.render('grades.html')

class AddConferencePageHandler(MyHandler):
    def get(self):
        self.setupUser()
        self.navbarSetup()
        self.templateValues['user'] = self.user
        self.templateValues['title'] = 'Conferencing | ClassTrack'
        # teacher_query = models.User.query().filter(models.User.user_type==1) #is a teacher
        # teachers = [teacher.to_dict() for teacher in teacher_query]
        # if len(teachers) == 0:
        #     self.templateValues['error'] = "Unable to locate teachers for your child. Your school may not have fully setup your child's account. Please try again later. If this persists, please contact your school's administrators."
        # self.templateValues['teachers'] = teacher_query
        
        participantList = []

        if self.user.user_type == teacher_user:
            student_key_value = int(self.request.get('student_value'))
            student_key = ndb.Key(models.User, student_key_value)
            student = student_key.get()
            parents = student.family
            for parent in parents:
                obj = parent.get()
                entry = {}
                entry['name'] = obj.first_name + " " + obj.last_name
                entry['value'] = obj.id()
                participantList.append(entry)
        elif self.user.user_type == parent_user:
            student_key_value = int(self.request.get('student_value'))
            student_key = ndb.Key(models.User, student_key_value)
            student = student_key.get()
            courses = student.course_list
            participantList = []
            for course in courses:
                obj = course.get()
                teachers = obj.teacher
                for teacher in teachers:
                    obj = teacher.get()
                    entry = {}
                    entry['name'] = obj.first_name + " " + obj.last_name
                    entry['value'] = obj.id()
                    participantList.append(entry)
        self.templateValues['participantList'] = json.dumps(participantList)
        self.login_check()
        self.render('addConference.html')


        

        # teacher_query = models.User.query().filter(models.User.user_type==1) #is a teacher
        # teachers = [teacher.to_dict() for teacher in teacher_query]
        # if len(teachers) == 0:
        #     self.templateValues['error'] = "Unable to locate teachers for your child. Your school may not have fully setup your child's account. Please try again later. If this persists, please contact your school's administrators."
        # self.templateValues['teachers'] = teacher_query

        # self.render('addConference.html')

        # teacher_query = models.User.query().filter(models.User.user_type==1) #is a teacher
        # teachers = [teacher.to_dict() for teacher in teacher_query]
        # if len(teachers) == 0:
        #     self.templateValues['error'] = "Unable to locate teachers for your child. Your school may not have fully setup your child's account. Please try again later. If this persists, please contact your school's administrators."
        # self.templateValues['teachers'] = teacher_query

    def post(self):
        ##Todo: Validate Input
        self.setupUser()
        extractedDateTime = datetime.strptime(self.request.get('date')+" "+self.request.get('time'), "%m/%d/%Y %I:%M%p")
        participant = int(self.request.get('participants'))
        participants = []
        participants.append(ndb.Key(models.User, self.user.id()))
        participants.append(ndb.Key(models.User, participant))
        # participants = [self.user.auth_ids[0], ndb.Key(models.User, participant)]

        # This section of code is from the master before merge 3-7-15
        # Keeping here to test changes from WebRTC
        # teacher = models.User.query(models.User.auth_ids==teachers).get()
        #teacher = [teacher.to_dict() for teacher in teacher_query]

        #self.response.write(teacher)

        # This section of code is from the master before merge 3-7-15
        # Keeping here to test changes from WebRTC
        # teacher = models.User.query(models.User.auth_ids==teachers).get()
        # teacher = [teacher.to_dict() for teacher in teacher_query]
        # self.response.write(teacher)

        # participant_id = []
        # names = ''
        # for auth_id in participants:
            # model_query = models.User.query().filter(models.User.auth_ids == auth_id).get()
            # participant_id.append(model_query.getKey().id()) # This adds an L to the end of the key, this may prove a problem later. - Daniel Vu
            # names += model_query.first_name + " "
            # names += model_query.last_name + ', '
        # clean_names = names[:-1]
        # teacher = models.User.query(models.User.auth_ids==teachers).get()

        # self.response.write(teacher)

        post = models.Conference(
                purpose = self.request.get('purpose'),
                participants = participants,
                # participant_ids = participant_id,
                datetime = extractedDateTime,
                # names_list = clean_names
            )
        key=post.put()

        #adding the conference to the user who made it
        this_user = self.user
        this_user.meetings.append(key)
        this_user.put()

        other_user = ndb.Key(models.User, participant).get()
        #in the future here we will make it invite the other person/add them in general
        other_user.meetings.append(key)
        other_user.put()
        

        other_full_name = other_user.first_name + other_user.last_name
        user_full_name = self.user.first_name + self.user.last_name

        #Email to Inviter
        sender_address="classtracknoreply@gmail.com"
        subject="Conference Invite - Classtrack"
        user_address = self.user.auth_ids[0]
        body = """
        Dear {name}:

        This email is confirming that you have invited {invited} to a video conference
        on: {date_and_time}.

        Thanks!
        Team Classtrack
        """.format(name=self.user.first_name, invited=other_full_name, date_and_time=extractedDateTime)

        mail.send_mail(sender_address, user_address, subject, body)

        #Email to Invited
        sender_address="classtracknoreply@gmail.com"
        subject="Conference Invite - Classtrack"
        user_address = other_user.auth_ids[0]
        body = """
        Dear {name}:

        {Inviter} has invited you to a video conference on: {date_and_time}.

        Thanks!
        Team Classtrack
        """.format(name=self.user.first_name, Inviter=user_full_name, date_and_time=extractedDateTime)

        mail.send_mail(sender_address, user_address, subject, body)

        self.response.write("<h1> Conference Added </h1>")


class DelConferenceHandler(MyHandler):
    def post(self):
        ##Todo: restirct access? Should parents be able to delete Conferences
        ##Todo: Validate Key ID
        key = self.request.get('roomkey')
        key2 = ndb.Key('Conference', int(key))
        key2.delete()
        
        ##Todo: Delete References in User Lists
        self.redirect('conferenceSchedule')

class ContactTeacherPageHandler(MyHandler):
    def get(self):
        self.setupUser()
        self.navbarSetup()
        self.templateValues['user'] = self.user
        self.templateValues['title'] = 'Inbox'
        self.login_check()

        #message_list = models.MessageThread.query().order(-models.MessageThread.time)
        message_list = self.user.messages
        self.templateValues['message_list'] = message_list
        #self.response.write(self.user.key)
        self.render('messaging.html')

class AddMessagePageHandler(MyHandler):
    def get(self):
        self.setupUser()
        self.navbarSetup()
        self.templateValues['user'] = self.user
        self.templateValues['title'] = 'Inbox'
        self.login_check()

        ##old code
        ##contacts_query = models.User.query().filter(models.User.user_type==1) #is a teacher
        
        contacts = set()
        ##check for user type - Parent
        if(self.user.user_type == parent_user):
            ##create list of contacts
            for child in self.user.family:
                for course in child.get().course_list:
                    for teacher in course.get().teacher:
                        contacts.add(teacher)
                        
         ##check for user type -- Teacher              
        elif(self.user.user_type == teacher_user):
            ##create list of contacts
            for course in self.user.course_list:
                for child in course.get().student_list:
                    for parent in child.get().family:
                        contacts.add(parent)

        ##contacts = [contact.to_dict() for contact in contact_query]
        if len(contacts) == 0:
            self.templateValues['error'] = "Unable to locate contacts for your account. Your school may not have fully setup its account. Please try again later. If this persists, please contact your school's administrators."

        self.templateValues['contacts'] = contacts
        self.render('addMessage.html')
        ##self.response.out.write(contacts)
        
    def post(self):
        self.setupUser()
        #NEED TO VALIDATE THESE ESPECIALLY THE RECIEVER ID
        theSubject = self.request.get('purpose')
        theMessage = self.request.get('message')
        recieverID = self.request.get('participants')

        message = models.PrivateMessage(
                sender = self.user.key,
                message = theMessage
        )
        messageID = message.put()

        thread = models.MessageThread(
                time = messageID.get().time,
                subject = theSubject,
                users = [self.user.key,ndb.Key('User',int(recieverID))],
                messageList = [messageID]
            )

        key = thread.put()

        this_user = self.user
        if not this_user.messages:
            this_user.messages = [key]
        else:
            this_user.messages += [key]

        this_user.put()
        
        this_user = ndb.Key('User',int(recieverID)).get()
        
        if not this_user.messages:
            this_user.messages = [key]
        else:
            this_user.messages += [key]

        this_user.put()

        self.response.write("<h1> Message Added </h1>")

class ReplyMessageHandler(MyHandler):
    def post(self):
        theMessage = self.request.get("message")

        message = models.PrivateMessage(
                sender = self.user.key,
                message = theMessage
        )
        messageID = message.put()

        id = self.request.get("roomkey")
        MessageThread = ndb.Key('MessageThread', int(id)).get()
        MessageThread.messageList += [messageID]
        MessageThread.put()

        self.response.write("<h1> Message Added: " + str(messageID.id()) +  " </h1>")

class ShowMessagePageHandler(MyHandler):
    def get(self):
        self.setupUser()
        self.navbarSetup()
        self.templateValues['user'] = self.user
        self.templateValues['title'] = 'Inbox'
        id = self.request.get("messageId")
        MessageList = ndb.Key('MessageThread', int(id)).get().messageList
        self.templateValues['MessageList'] = MessageList
        self.templateValues['RoomKey'] = id
        self.login_check()
        self.render('showMessage.html')

class ClassSelectPageHandler(MyHandler):
    def get(self):
        self.setupUser()
        self.navbarSetup()
        self.templateValues['user'] = self.user
        self.templateValues['title'] = 'Class Select | ClassTrack'
        courseList = ['Math', 'PE', 'Geography', 'English'] # These need to go to the class select handler
        self.templateValues['courseList'] = courseList
        self.templateValues['selected_class'] = courseList[len(courseList)-1]
        self.login_check()
        self.render('classSelect.html')

#MUST BE UPDATED TO ADD KEYS TO USER
class AddChildHandler(MyHandler):
    def get(self):
        self.setupUser()
        self.navbarSetup()
        self.templateValues['user'] = self.user
        self.templateValues['title'] = 'Add Child'
        self.login_check()
        self.render('addChild.html')

    def post(self):
        student_id = self.request.get("student_id")
        student = models.User.query(models.User.auth_ids==student_id).fetch()[0]
        this_user = self.user
        this_user.family.append(student.key)
        this_user.put()
        student.family.append(this_user.key)
        student.put()

class LookupChildHandler(MyHandler):
    def post(self):
        student_id = self.request.get("childID")
        
        student_query = models.User.query().filter(models.User.auth_ids==student_id,models.User.user_type == 3)
        self.response.out.write(json.dumps([p.to_dict() for p in student_query], default=default))

class AddPostHandler(MyHandler):
    def get(self):
        self.templateValues = {}
        self.login_check()
        self.render('addPost.html')
    def post(self):
        nfpost = models.NFPost(
                caption = self.request.get('post-caption'),
                typeID = int(self.request.get('post-typeID')),
                owner = str(self.user_info['auth_ids'][0])
            )
        nfpost.put()

class TeacherRegistrationHandler(MyHandler):
    def get(self):
        self.setupUser()
        self.navbarSetup()
        self.templateValues['title'] = 'Teacher Registration'
        self.render('teacherRegistration.html')

class ChildRegistrationHandler(MyHandler):
    def get(self):
        self.setupUser()
        self.navbarSetup()
        self.templateValues['user'] = self.user
        self.templateValues['title'] = 'Child Registration'
        self.render('childRegistration.html')

class SchoolSetupHandler(MyHandler):
    def get(self):
        self.setupUser()
        self.navbarSetup()
        self.templateValues['user'] = self.user
        self.templateValues['title'] = 'School Setup'
        self.render('schoolSetup.html')

    def post(self):
        school = models.School(
                name = self.request.get('school_name'),
                primary_color = self.request.get('school_color_primary'),
                secondary_color = self.request.get('school_color_secondary'),
                address = self.request.get('school_address'),
                state = self.request.get('school_state'),
                county = self.request.get('school_county'),
                zipcode = self.request.get('school_zipcode'),
                phone = self.request.get('school_phone')
            )
        school.put()

        # school_query = models.School.query().filter(models.School.admins==self.user.key)
        # schools = [school.key for school in school_query]
        # self.user.school = schools
        # self.user.key.get().put()

        self.redirect('/')


class CreateAdminHandler(MyHandler):
    def get(self):
        self.setupUser()
        user_data = self.user_model.create_user('admin@classtrack.com',
            first_name='Admin',
            password_raw='admin',
            last_name='AdminLastName',
            user_type=admin_user,
            family=[],
            school= [],
            verified=False,
            courseList=[],
            meetings=[],
            messageThreads=[])

        self.redirect('/')


class ProfileHandler(MyHandler):
    def get(self):
        self.setupUser()
        self.navbarSetup()
        self.render('profile.html')

        # first_name = ndb.StringProperty()
        # last_name = ndb.StringProperty()
        # user_type = ndb.IntegerProperty()
        # meetings = ndb.KeyProperty(kind='Conference', repeated=True)
        # invited = ndb.KeyProperty(kind='Conference', repeated=True)
        # family = ndb.KeyProperty(kind='User',repeated=True)
        # message_threads = ndb.KeyProperty(kind='MessageThread',repeated=True)
        # messages = ndb.KeyProperty(kind='MessageThread',repeated=True)
        # course_list = ndb.KeyProperty(kind='Course',repeated=True)
        # hasCourses = ndb.ComputedProperty(lambda self: len(self.course_list) != 0)
        # school = ndb.KeyProperty(kind='School',repeated=True)

class EditProfileHandler(MyHandler):
    def get(self):
        self.setupUser()
        self.navbarSetup()
        testText = 'test of varaible passing'
        self.render('profileEdit.html')


class ConferenceMessageChannelHandler(MyHandler):
    def get(self):
        self.templateValues = {}
        self.render('ConferenceMessageChannel.html')

    def post(self):
        self.templateValues = {}
        user_id = self.request.get('user_id')
        # channel.create_channel(user_id);
        message = self.request.body
        user_query = models.User.query()
        channel.send_message(identifier, "Hello World, from " + user_id)
        # for x in range(0,60):
        #     time.sleep(1)
        #     for user in user_query:
        #         channel.create_channel(user.auth_ids[0]);
        #         channel.send_message(user.auth_ids[0], message)
        # channel.send_message(self.user_info['auth_ids'][0], message)
        self.render('ConferenceMessageChannel.html')

class ConferencePageHandler(MyHandler):

    def get(self):
        self.setupUser()
        self.navbarSetup()
        self.login_check()

        dtls = self.request.get('dtls')
        dscp = self.request.get('dscp')
        ipv6 = self.request.get('ipv6')

        roomkey = self.request.get('roomkey')
        purpose = models.Conference.get_by_id(int(roomkey)).purpose
        participants = models.Conference.get_by_id(int(roomkey)).participants
        datetime = models.Conference.get_by_id(int(roomkey)).datetime
        user_id = str(self.user_info['user_id'])
        pc_constraints = make_pc_constraints(dtls, dscp, ipv6)

        initiator = 'true';
        conference = models.Conference.get_by_id(int(roomkey))
        # if len(conference.currentLoggedInUsers) != 0:
        # if conference.currentLoggedInUsers[0] != user_id:
        # logging.warning("THIS IS THE INITIATOR")
        # logging.warning(conference.participant_ids[0])
        # logging.warning("THIS IS THE CURRENT USER")
        # logging.warning(user_id)
        # logging.warning()

        if int(user_id) == int(conference.participant_ids[0]):
            initiator = 'false';

        identifier = roomkey + user_id
        token = channel.create_channel(identifier)
        self.templateValues['token'] = token

        audio_receive_codec = self.request.get('arc')
        if not audio_receive_codec:
            audio_receive_codec = get_preferred_audio_receive_codec()

        user_agent = self.request.headers['User-Agent']
        audio_send_codec = self.request.get('asc')
        if not audio_send_codec:
            audio_send_codec = get_preferred_audio_send_codec(user_agent)

        self.templateValues['user'] = self.user
        self.templateValues['title'] = 'Conferencing | ClassTrack'
        self.templateValues['purpose'] = purpose
        self.templateValues['participants'] = participants
        self.templateValues['datetime'] = datetime
        self.templateValues['roomkey'] = roomkey
        self.templateValues['user_id'] = user_id
        self.templateValues['audio_send_codec'] = audio_send_codec
        self.templateValues['audio_receive_codec'] = audio_receive_codec
        self.templateValues['pc_constraints'] = pc_constraints
        self.templateValues['initiator'] = initiator
        self.render('conference.html')

    def post(self):
        roomkey = self.request.get('roomkey')
        user_id = self.request.get('user_id')
        # logging.info("value of my roomkey is %s", str(roomkey))
        conference = models.Conference.get_by_id(int(roomkey))
        # logging.warning("User " + user_id + " has logged in")
        # conference.currentLoggedInUsers.append(user_id)
        # conference.put()
        message = self.request.body
        # logging.info("Message is %s", str(message))
        for u_id in conference.currentLoggedInUsers:
            if u_id != user_id:
                channel.send_message(roomkey+u_id, message)
            # channel.send_message(roomkey+user_id, message)
            # channel.send_message(roomkey+user, '{"one" : "1", "two" : "2", "three" : "3"}')
            
        # logging.warning("================ HELLO WORLD =================")

        # token = channel.create_channel(identifier)
        # self.templateValues['token'] = token

        # channel.send_message(identifier, "Hello World, from " + user_id)
        # if len(room.currentLoggedInUsers) != 0:
        #     send_to = room.currentLoggedInUsers[0]
        #     channel.send_message(roomkey + send_to, "Hello World, from " + user_id)
        # else:
        #     send_to = user_id
            # channel.send_message(roomkey + send_to, "Hello World, from " + user_id)
        # message = self.request.get('message')
        # if message:
        #     channel.send_message(1, message)
        # self.render('conference.html')


class ChannelConnectionHandler(MyHandler):
    def post(self):
        self.setupUser()
        logging.warning(self.request.get('from'))

    def get(self):
        self.setupUser()
        logging.warning(self.request.get('from'))
        user_id = self.request.get('user_id')
        roomkey = self.request.get('roomkey')
        conference = models.Conference.get_by_id(int(roomkey))
        if user_id not in conference.currentLoggedInUsers:
            conference.currentLoggedInUsers.append(user_id)
            conference.put()


class ChannelDisconnectionHandler(MyHandler):
    def get(self):
        self.setupUser()
        logging.warning(self.request.get('from'))
        user_id = self.request.get('user_id')
        roomkey = self.request.get('roomkey')
        logging.warning("THIS IS THE ROOMKEY")
        logging.warning(roomkey)
        conference = models.Conference.get_by_id(int(roomkey))
        conference.currentLoggedInUsers.remove(user_id)
        conference.put()

class SendMessageHandler(MyHandler):
    def get(self):
        self.templateValues = {}
        self.render('testSendMessage.html')

class ClassManagementHandler(MyHandler):
    def get(self):
        self.setupUser()
        courseList = []
        if self.user.courseList:
            teacherCourseList = self.user.courseList
            for course in teacherCourseList:
                data = course.get()
                entry = {}
                entry['name'] = data.name
                entry['key'] = course.id()
                courseList.append(entry)

        self.templateValues['courseList'] = courseList
        self.render('classManagement.html')


class AddChildrenToClassHandler(MyHandler):
    def post(self):
        self.setupUser()
        self.navbarSetup()
        self.templateValues['user'] = self.user
        self.templateValues['title'] = 'Add Child to Class'
        self.login_check()

        self.templateValues['courseID'] = self.request.get('courseID')

        courseID = int(self.request.get('courseID'))
        changeOccured = self.request.get('changeOccured')

        if changeOccured:
            if self.request.get('potential-students'):
                potential_list = self.request.params.getall('potential-students')
                for student_id in potential_list:
                    if student_id != '':
                        student = models.User.get_by_id(int(student_id))
                        if student:
                            if ndb.Key(models.Course, courseID) in student.course_list:
                                student.course_list.remove(ndb.Key(models.Course, courseID))
                                student.put()

            if self.request.get('current-students'):
                current_list = self.request.params.getall('current-students')
                for student_id in current_list:
                    if student_id != '':
                        student = models.User.get_by_id(int(student_id))
                        if student:
                            if ndb.Key(models.Course, courseID) not in student.course_list:
                                student.course_list.append(ndb.Key(models.Course, courseID))
                                student.put()


        student_query = models.User.query(ndb.AND(models.User.user_type==3, models.User.school == self.user.school[0])) #We are currently assuming that the teachers only have one school - Daniel Vu
        currentCourse = ndb.Key(models.Course, courseID)
        current_query = student_query.filter(models.User.course_list == currentCourse)

        potential_query = []

        current_list = []
        current_value_list = []
        for student in current_query:
            entry = {}
            entry['name'] = student.first_name + " " + student.last_name
            entry['value'] = student.id()
            current_value_list.append(student.id())
            current_list.append(entry)

        for student in student_query:
            contains = False
            if student.id() in current_value_list:
               contains = True
            if not contains:
                potential_query.append(student)


        potential_list = []
        for student in potential_query:
            entry = {}
            entry['name'] = student.first_name + " " + student.last_name
            entry['value'] = student.id()
            potential_list.append(entry)

        self.templateValues['potential_list'] = json.dumps(potential_list)
        self.templateValues['current_list'] = json.dumps(current_list)
        self.render('addChildrenToClass.html')


class SelectCourseMenuHandler(MyHandler):
    def get(self):
        self.setupUser()
        self.navbarSetup()
        self.templateValues['user'] = self.user
        self.templateValues['title'] = 'Conferencing | ClassTrack'
        if self.user.user_type != 1:
            self.templateValues['error'] = 'You do not have permission to access this page.'
            self.render('fancyboxError.html')
        else:
            courses = self.user.courseList
            courseList = []
            for course in courses:
                    entry = {}
                    obj = course.get()
                    entry['name'] = obj.name
                    entry['value'] = course.id()
                    courseList.append(entry)
            self.templateValues['courses'] = json.dumps(courseList)
            self.render('selectCourseMenu.html')

class SelectChildMenuHandler(MyHandler):
    def get(self):
        self.setupUser()
        self.navbarSetup()
        self.templateValues['user'] = self.user
        self.templateValues['title'] = 'Conferencing | ClassTrack'
        childrenList = []

        if self.user.user_type == 1: # If the user is a teacher
            course = self.request.get('course')
            self.templateValues['course'] = course
            if course:
                course = int(self.request.get('course'))
                currentCourse = ndb.Key(models.Course, course)
                students = models.User.query(models.User.course_list == currentCourse)
                for student in students:
                    entry = {}
                    entry['name'] = student.first_name + " " + student.last_name
                    entry['value'] = student.id()
                    childrenList.append(entry)
        elif self.user.user_type == 2: # if the user is a parent
            children = self.user.family
            for child in children:
                obj = child.get()
                entry = {}
                entry['name'] = obj.first_name + " " + obj.last_name
                entry['value'] = obj.id()
                childrenList.append(entry)
        self.templateValues['children'] = json.dumps(childrenList)
        self.render('selectChildMenu.html')

# Dummy data handlers
class MakeDummyChildrenHandler(MyHandler):
    def get(self):
        requested_school_1 = models.School.query(models.School.name == 'Seneca Middle School').fetch(1, keys_only = True)
        requested_school_2 = models.School.query(models.School.name == 'Mauldin Middle School').fetch(1, keys_only = True)
        default_course = models.Course.query(models.Course.name == 'DEFAULTNONECOURSE').fetch(1, keys_only = True)

        new_child = models.User(
            first_name = 'Devin',
            last_name = 'Crawford',
            user_type = 3,
            school = requested_school_1,
            course_list = default_course
        )
        new_child.put()

        new_child = models.User(
            first_name = 'Micheal',
            last_name = 'Campbell',
            user_type = 3,
            school = requested_school_1,
            course_list = default_course

        )
        new_child.put()

        new_child = models.User(
            first_name = 'Sam',
            last_name = 'Ballard',
            user_type = 3,
            school = requested_school_1,
            course_list = default_course
        )
        new_child.put()

        new_child = models.User(
            first_name = 'Rodolfo',
            last_name = 'Frazier',
            user_type = 3,
            school = requested_school_1,
            course_list = default_course

        )
        new_child.put()

        new_child = models.User(
            first_name = 'Edith',
            last_name = 'Wolfe',
            user_type = 3,
            school = requested_school_1,
            course_list = default_course

        )
        new_child.put()

        new_child = models.User(
            first_name = 'Stuart',
            last_name = 'Neal',
            user_type = 3,
            school = requested_school_2,
            course_list = default_course

        )
        new_child.put()

        new_child = models.User(
            first_name = 'Darlene',
            last_name = 'Osborne',
            user_type = 3,
            school = requested_school_2,
            course_list = default_course

        )
        new_child.put()

        new_child = models.User(
            first_name = 'Taylor',
            last_name = 'Griffith',
            user_type = 3,
            school = requested_school_2,
            course_list = default_course

        )
        new_child.put()

class InitNDBHandler(MyHandler):
    def get(self):
        newschool = models.School(
                name = 'Seneca Middle School',
                address = '810 W South 4th St, Seneca, SC 29678',
                phone = '555-555-5555',
                state = 'South Carolina',
                county = 'Oconee',
                zipcode = '55555',
                primary_color = 'FFFFFF',
                secondary_color = 'FFFFFF'
            )

        Seneca = newschool.put()

        #Make Class
        newclass = models.Course(
        school = Seneca,
        name = "Math 142"
        )
        mathclass = newclass.put()

        #Link School and Class
        Seneca.get().class_list = [mathclass]

        Seneca = Seneca.get().put()

        #Teacher
        user_data = self.user_model.create_user("jgoodmen@cse.sc.edu",
            first_name="John",
            password_raw="password",
            last_name="Goodmen",
            user_type=teacher_user,
            family=[],
            verified=True,
            class_list=[mathclass],
            meetings=[],
            messageThreads=[],
            school = [Seneca])

        #Link Teacher
        Seneca.get().teachers.append(user_data[1].key)
        mathclass.get().teacher.append(user_data[1].key)

        Seneca = Seneca.get().put()
        mathclass = mathclass.get().put()


        #Add Students and Add to List
        studentList = []

        new_child = models.User(
            auth_ids = ["1227"],
            first_name = 'Devin',
            last_name = 'Crawford',
            user_type = 3,
            school = [Seneca],
            course_list = [mathclass]
        )

        studentList.append(new_child.put())

        new_child = models.User(
            auth_ids = ["1228"],
            first_name = 'Micheal',
            last_name = 'Campbell',
            user_type = 3,
            school = [Seneca],
            course_list = [mathclass]

        )
        studentList.append(new_child.put())

        new_child = models.User(
            auth_ids = ["1229"],
            first_name = 'Sam',
            last_name = 'Ballard',
            user_type = 3,
            school = [Seneca],
            course_list = [mathclass],

        )
        studentList.append(new_child.put())

        new_child = models.User(
            auth_ids = ["1230"],
            first_name = 'Rodolfo',
            last_name = 'Frazier',
            user_type = 3,
            school = [Seneca],
            course_list = [mathclass]

        )
        studentList.append(new_child.put())

        new_child = models.User(
            auth_ids = ["1231"],
            first_name = 'Edith',
            last_name = 'Wolfe',
            user_type = 3,
            school = [Seneca],
            course_list = [mathclass]

        )
        studentList.append(new_child.put())

        new_child = models.User(
            auth_ids = ["1232"],
            first_name = 'Stuart',
            last_name = 'Neal',
            user_type = 3,
            school = [Seneca],
            course_list = [mathclass]

        )
        studentList.append(new_child.put())

        new_child = models.User(
            auth_ids = ["1233"],
            first_name = 'Darlene',
            last_name = 'Osborne',
            user_type = 3,
            school = [Seneca],
            course_list = [mathclass]

        )

        studentList.append(new_child.put())

        new_child = models.User(
            auth_ids = ["1234"],
            first_name = 'Taylor',
            last_name = 'Griffith',
            user_type = 3,
            school = [Seneca],
            course_list = [mathclass]

        )
        studentList.append(new_child.put())

        #Link Students
        Seneca.get().students = studentList
        mathclass.get().student_list = studentList

        Seneca.get().put()
        mathclass.get().put()

        self.redirect('/')


config = {
  'webapp2_extras.auth': {
    'user_model': 'models.User',
    'user_attributes': ['auth_ids']
  },
  'webapp2_extras.sessions': {
    'secret_key': 'YOUR_SECRET_KEY'
  }
}

app = webapp2.WSGIApplication([
    webapp2.Route('/', MainPageHandler, name='home'),
    webapp2.Route('/index', MainPageHandler, name='index'),
    webapp2.Route('/schoolGetter', SchoolNameHandler, name='schoolGetter'),
    webapp2.Route('/signup', SignupPageHandler),
    webapp2.Route('/<type:v|p>/<user_id:\d+>-<signup_token:.+>', VerificationHandler, name='verification'),
    webapp2.Route('/password', SetPasswordHandler),
    webapp2.Route('/login', LoginPageHandler, name='login'),
    webapp2.Route('/logout', LogoutPageHandler, name='logout'),
    webapp2.Route('/forgot', ForgotPasswordHandler, name='forgot'),
    webapp2.Route('/authenticated', AuthenticatedHandler, name='authenticated'),
    webapp2.Route('/post', PostHandler, name='post'),
    webapp2.Route('/jqNFpost', jqueryPostHandler, name='post'),
    webapp2.Route('/message', PrivateMessageHandler, name='post'),
    webapp2.Route('/home', HomePageHandler, name='home'),
    webapp2.Route('/portal/', PortalPageHandler, name='portal'),
    webapp2.Route('/about', AboutPageHandler, name='about'),
    webapp2.Route('/contact', ContactPageHandler, name='contact'),
    webapp2.Route('/lookupChild', LookupChildHandler, name='lookupChild'),
    webapp2.Route('/calendar',CalendarPageHandler, name='calendar'),
    webapp2.Route('/grades',GradesPageHandler, name='grades'),
    #webapp2.Route('/documents',DocumentsPageHandler, name='documents'),
    webapp2.Route('/conference',ConferencePageHandler, name='chatroom'),
    webapp2.Route('/conferenceSchedule',ConferenceSchedulerPageHandler, name='chatroomscheduler'),
    webapp2.Route('/selectCourseMenu',SelectCourseMenuHandler, name='selectCourseMenu'),
    webapp2.Route('/selectChildMenu',SelectChildMenuHandler, name='selectChildMenu'),
    webapp2.Route('/addConference',AddConferencePageHandler, name='addConference'),
    #webapp2.Route('/acceptConference', AcceptConferenceHandler, name='acceptConference'),
    webapp2.Route('/delConference',DelConferenceHandler, name='delConference'),
    webapp2.Route('/messaging',ContactTeacherPageHandler, name='messaging'),
    webapp2.Route('/showMessage',ShowMessagePageHandler, name='showmessage'),
    webapp2.Route('/addMessage',AddMessagePageHandler, name='addmessage'),
    webapp2.Route('/replyMessage',ReplyMessageHandler, name='replymessage'),
    webapp2.Route('/classSelect',ClassSelectPageHandler, name='classselect'),
    webapp2.Route('/schoolSetup',SchoolSetupHandler, name='schoolsetup'),
    webapp2.Route('/makeNDB',InitNDBHandler, name='initNDB'),
    webapp2.Route('/addChild', AddChildHandler, name='addChild'),
    webapp2.Route('/addChildrenToClass', AddChildrenToClassHandler, name='addChild'),
    webapp2.Route('/addPost', AddPostHandler, name='addPost'),
    webapp2.Route('/childRegistration', ChildRegistrationHandler, name='childRegistration'),
    webapp2.Route('/teacherRegistration', TeacherRegistrationHandler, name='teacherRegistration'),
    webapp2.Route('/profile', ProfileHandler, name='profile'),
    webapp2.Route('/profileEdit', EditProfileHandler, name='profileEdit'),
    webapp2.Route('/classSelect',ClassSelectPageHandler, name='classselect'),
    # webapp2.Route('/.*', NotFoundPageHandler, name='notFound'),
    webapp2.Route('/createAdmin', CreateAdminHandler, name='CreateAdmin'),
    webapp2.Route('/makeDummyChildren', MakeDummyChildrenHandler, name="makeDummyChildren"),
    webapp2.Route('/classManagement', ClassManagementHandler, name='classManagement'),
    # webapp2.Route('/_ah/channel/connected/', ChannelConnectionHandler, name='ConnectionHandler'),
    # webapp2.Route('/_ah/channel/disconnected/', ChannelDisconnectionHandler, name='DisconnectionHandler'),
    # webapp2.Route('/testSendMessage', SendMessageHandler, name='SendMessageHandler')
    webapp2.Route('/.*', NotFoundPageHandler)
], debug=True, config=config)
