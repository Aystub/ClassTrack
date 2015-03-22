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

    #         #Classes
    #         class_list = ['Math', 'PE', 'Geography', 'English'] # These need to go to the class select handler
    #         self.templateValues['selected_class'] = class_list[len(class_list)-1]
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
            self.templateValues['first_name'] = self.user_model.get_by_id(self.user_info['user_id']).first_name
            self.templateValues['username'] = self.user_info['auth_ids'][0]
            self.templateValues['usertype'] = self.user_model.get_by_id(self.user_info['user_id']).user_type
            if self.user.school:
                self.templateValues['primaryColor'] = models.School.query(ancestor=self.user.school[0]).fetch()[0].primary_color
                self.templateValues['secondaryColor'] = models.School.query(ancestor=self.user.school[0]).fetch()[0].secondary_color

            #Children
            children_ids = self.user.family
            if children_ids: #list is not empty
                children_query = models.User.query(models.User.auth_ids.IN(children_ids))
                self.templateValues['children_list'] = children_query

            #Classes
            class_list = ['Math', 'PE', 'Geography', 'English'] # These need to go to the class select handler
            self.templateValues['selected_class'] = class_list[len(class_list)-1]
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
        password = self.request.get('password')
        email = self.request.get('email')
        first_name = self.request.get('fname')
        last_name = self.request.get('lname')
        teacher_code = self.request.get('teacher_code')
        student_id = self.request.get('student_id')
        verified = False
        if teacher_code:
            user_type = teacher_user
        elif student_id:
            user_type = student_user
            verified = True
            email = student_id #Make student_id the auth_id for students
        else:
            user_type = parent_user

        child = []
        classList = []
        meeting = []
        messageThread = []

        user_data = self.user_model.create_user(email,
            first_name=first_name,
            password_raw=password,
            last_name=last_name,
            user_type=user_type,
            children=child,
            verified=verified,
            classList=classList,
            meetings=meeting,
            messageThreads=messageThread)



        if not user_data[0]: #user_data is a tuple
            self.display_message('Unable to create user for email %s because of duplicate keys %s' % (email, user_data[1]))
            return

        if not student_id:
            user = user_data[1]
            user_id = user.get_id()

            token = self.user_model.create_signup_token(user_id)

            verification_url = self.uri_for('verification', type='v', user_id=user_id, signup_token=token, _full=True)

            msg = 'Send an email to user in order to verify their address. They will be able to do so by visiting <a href="{url}">{url}</a>'

            self.display_message(msg.format(url=verification_url))
        else:
            self.redirect('/childRegistration')

class VerificationHandler(MyHandler):
    def get(self, *args, **kwargs):
        user = None
        user_id = kwargs['user_id']
        signup_token = kwargs['signup_token']
        verification_type = kwargs['type']
        # it should be something more concise like
        # self.auth.get_user_by_token(user_id, signup_token)
        # unfortunately the auth interface does not (yet) allow to manipulate
        # signup tokens concisely
        user, ts = self.user_model.get_by_auth_token(int(user_id), signup_token,'signup')

        if not user:
            logging.info('Could not find any user with id "%s" signup token "%s"', user_id, signup_token)
            self.abort(404)

        # store user data in the session
        self.auth.set_session(self.auth.store.user_to_dict(user), remember=True)

        if verification_type == 'v':
            # remove signup token, we don't want users to come back with an old link
            self.user_model.delete_signup_token(user.get_id(), signup_token)

            if not user.verified:
                user.verified = True
                user.put()

            self.display_message('User email address has been verified.')
            return

        elif verification_type == 'p':
            # supply user to the page
            params = {
                'user': user,
                'token': signup_token
            }
            self.render('resetpassword.html', params)
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
        qry = models.NFPost.query().order(-models.NFPost.time).fetch()
        self.templateValues['newsfeed_list'] = qry
        self.login_check()
        self.render('home.html')


class SetPasswordHandler(MyHandler):
    def get(self):
        self.redirect('/')
    @user_required
    def post(self):
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
        self._serve_page()

    def post(self):
        username = self.request.get('user_name')

        user = self.user_model.get_by_auth_id(username)
        if not user:
            logging.info('Could not find any user entry for username %s', username)
            self._serve_page(not_found=True)
            return

        user_id = user.get_id()
        token = self.user_model.create_signup_token(user_id)

        verification_url = self.uri_for('verification', type='p', user_id=user_id, signup_token=token, _full=True)

        msg = 'Send an email to user in order to reset their password. They will be able to do so by visiting <a href="{url}">{url}</a>'

        self.display_message(msg.format(url=verification_url))

    def _serve_page(self, not_found=False):
        username = self.request.get('username')
        self.templateValues['username'] = user_name
        self.templateValues['not_found'] = not_found
        self.render('forgot.html')



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
            self.redirect('/')
            #this_user = self.user
            #if this_user.children == ['None']:
            #    this_user.children = [link]
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
        conference_query = models.Conference.query()
        conference_list = conference_query.filter(self.user_info['user_id'] == models.Conference.participant_ids)
        part_list = [];
        for conf in conference_list:
            names=''
            small_list = conf.participants
            for part in small_list:
                person_query = models.User.query().filter(models.User.auth_ids==part)
                person = [person.to_dict() for person in person_query]
                names += person[0]['first_name'] + " "
                names += person[0]['last_name']
                names += ', '
            part_list.append(names)
        conference_invitation_list = [{'time':'1-5-2015 3:00 pm' ,'message':'Catch Up', 'participants':'Sarah, Hailey'}]
        self.templateValues['user'] = self.user
        self.templateValues['title'] = 'Schedule a Conference | ClassTrack'
        self.templateValues['conference_list'] = conference_list
        self.templateValues['conference_invitation_list'] = conference_invitation_list
        self.templateValues['part_list'] = part_list
        self.login_check()
        self.render('conferenceSchedule.html')


class AddConferencePageHandler(MyHandler):
    def get(self):
        self.setupUser()
        self.navbarSetup()
        self.templateValues['user'] = self.user
        self.templateValues['title'] = 'Conferencing | ClassTrack'
        teacher_query = models.User.query().filter(models.User.user_type==1) #is a teacher
        teachers = [teacher.to_dict() for teacher in teacher_query]
        self.templateValues['teachers'] = teacher_query
        self.login_check()
        self.render('addConference.html')

    def post(self):
        self.setupUser()
        extractedDateTime = datetime.strptime(self.request.get('date')+" "+self.request.get('time'), "%m/%d/%Y %I:%M%p")
        teachers = self.request.get('participants')
        participants = [self.user_info['auth_ids'][0],teachers]
        # This section of code is from the master before merge 3-7-15
        # Keeping here to test changes from WebRTC
        # teacher = models.User.query(models.User.auth_ids==teachers).get()
        #teacher = [teacher.to_dict() for teacher in teacher_query]

        #self.response.write(teacher)

        participant_id = []
        for auth_id in participants:
            model_query = models.User.query().filter(models.User.auth_ids == auth_id).get()
            participant_id.append(model_query.getKey().id()) # This adds an L to the end of the key, this may prove a problem later. - Daniel Vu
        teacher = models.User.query(models.User.auth_ids==teachers).get()

        # self.response.write(teacher)

        post = models.Conference(
                purpose = self.request.get('purpose'),
                participants = participants,
                participant_ids = participant_id,
                datetime = extractedDateTime
            )
        key=post.put()

        #adding the conference to the user who made it
        this_user = self.user
        if not this_user.meetings:
            this_user.meetings = [key]
        else:
            this_user.meetings += [key]


        #in the future here we will make it invite the other person/add them in general
        if not teacher.meetings:
            teacher.meetings = [key]
        else:
            teacher.meetings += [key]

        teacher.put()
        this_user.put()

        self.response.write("<h1> Conference Added </h1>")


class DelConferenceHandler(MyHandler):
    def post(self):
        key = self.request.get('roomkey')
        key2 = ndb.Key('Conference', int(key))
        key2.delete()
        self.redirect('conferenceSchedule')



class ContactTeacherPageHandler(MyHandler):
    def get(self):
        self.setupUser()
        self.navbarSetup()
        self.templateValues['user'] = self.user
        self.templateValues['title'] = 'Inbox'
        self.login_check()


        message_list = models.MessageThread.query().order(-models.MessageThread.time).fetch() # We need to change the query to give our messages
        message_list_count = 0
        self.templateValues['message_list_count'] = message_list_count
        self.templateValues['message_list'] = message_list


        self.render('messaging.html')

class AddMessagePageHandler(MyHandler):
    def get(self):
        self.setupUser()
        self.navbarSetup()
        self.templateValues['user'] = self.user
        self.templateValues['title'] = 'Inbox'
        self.login_check()

        message_list = models.MessageThread.query()
        self.templateValues['message_list'] = message_list

        teacher_query = models.User.query().filter(models.User.user_type==1) #is a teacher
        teachers = [teacher.to_dict() for teacher in teacher_query]
        self.templateValues['teachers'] = teacher_query
        self.render('addMessage.html')

    def post(self):
        self.setupUser()
        theSubject = self.request.get('purpose')
        theMessage = self.request.get('message')
        teachers = self.request.get('participants')

        participants = [self.user_info['auth_ids'][0],teachers]

        # participant_id = []
        # for auth_id in participants:
        #     model_query = models.User.query().filter(models.User.auth_ids == auth_id).get()
        #     participant_id.append(model_query.getKey().id()) # This adds an L to the end of the key, this may prove a problem later. - Daniel Vu
        # teacher = models.User.query(models.User.auth_ids==teachers).get()

        # participants = self.user.first_name+' '+self.user.last_name+', '+teachers

        message = models.PrivateMessage(
                sender = self.user.key,
                # recipient = participant_id[len(participant_id)-1],
                message = theMessage
        )
        messageID = message.put()

        thread = models.MessageThread(
                time = messageID.get().time,
                subject = theSubject,
                users = [self.user.key],
                messageList = [messageID]
            )
        thread.put()
        self.response.write("<h1> Message Added </h1>")

class ShowMessagePageHandler(MyHandler):
    def get(self):
        self.setupUser()
        self.navbarSetup()
        self.templateValues['user'] = self.user
        self.templateValues['title'] = 'Inbox'
        id = self.request.get("messageId")
        MessageList = ndb.Key('MessageThread', int(id)).get().messageList
        self.templateValues['MessageList'] = MessageList
        self.login_check()
        self.render('showMessage.html')

class ClassSelectPageHandler(MyHandler):
    def get(self):
        self.setupUser()
        self.navbarSetup()
        self.templateValues['user'] = self.user
        self.templateValues['title'] = 'Class Select | ClassTrack'
        class_list = ['Math', 'PE', 'Geography', 'English'] # These need to go to the class select handler
        self.templateValues['class_list'] = class_list
        self.templateValues['selected_class'] = class_list[len(class_list)-1]
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
        student = ndb.Key("User",int(student_id)).get()
        this_user = self.user
        if this_user.family == ['None']:
            this_user.family = [student.key]
        else:
            this_user.family += [student.key]
        this_user.put()

        if student.family == ['None']:
            student.family = [this_user.key]
        else:
            student.family += [this_user.key]

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

class InitNDBHandler(MyHandler):
    def get(self):
        #********Posts***********
        nfpost = models.NFPost(
                caption = 'Last Element',
                typeID = 0,
                owner = str(self.user_info['auth_ids'][0])
            )
        nfpost.put()

        nfpost = models.NFPost(
                caption = 'Flu shots will be given 11/19/14',
                typeID = 1,
                owner = str(self.user_info['auth_ids'][0])
            )
        nfpost.put()

        nfpost = models.NFPost(
                caption = 'Sarah made an 87 on her English Test',
                typeID = 3,
                owner = str(self.user_info['auth_ids'][0])
            )
        nfpost.put()
        nfpost = models.NFPost(
                caption = 'PTA is holding a meeting on 12/5/14',
                typeID = 2,
                owner = str(self.user_info['auth_ids'][0])
            )
        nfpost.put()
        nfpost = models.NFPost(
                caption = 'Prom has been scheduled for 4/20!!',
                typeID = 5,
                owner = str(self.user_info['auth_ids'][0])
            )
        nfpost.put()
        nfpost = models.NFPost(
                caption = 'Please complete reading from chapter 11 by Friday!',
                typeID = 4,
                owner = str(self.user_info['auth_ids'][0])
            )
        nfpost.put()
        nfpost = models.NFPost(
                caption = 'LHS went 41-27 against CHS!',
                typeID = 1,
                owner = str(self.user_info['auth_ids'][0])
            )
        nfpost.put()

        #******SCHOOLS*******
        newschool = models.School(
                name = 'Seneca Middle School',
                state = 'South Carolina',
                zipcode = '55555',
                county = 'Seneca',
                address = 'Example Address',
                phone = '555-555-5555'
            )
        newschool.put()
        newschool = models.School(
                name = 'Hogwarts School of Witchcraft and Wizardry',
                state = 'South Carolina',
                zipcode = '55555',
                county = 'Seneca',
                address = 'Example Address',
                phone = '555-555-5555'
            )
        newschool.put()
        newschool = models.School(
                name = 'Ashford Academy',
                state = 'South Carolina',
                zipcode = '55555',
                county = 'Seneca',
                address = 'Example Address',
                phone = '555-555-5555'
            )
        newschool.put()
        newschool = models.School(
                name = 'Naoetsu Private High School',
                state = 'South Carolina',
                zipcode = '55555',
                county = 'Seneca',
                address = 'Example Address',
                phone = '555-555-5555'
            )
        newschool.put()
        newschool = models.School(
                name = 'Fumizuki Academy',
                state = 'South Carolina',
                zipcode = '55555',
                county = 'Seneca',
                address = 'Example Address',
                phone = '555-555-5555'
            )
        newschool.put()
        newschool = models.School(
                name = 'Private Magic University Affiliated High School',
                state = 'South Carolina',
                zipcode = '55555',
                county = 'Seneca',
                address = 'Example Address',
                phone = '555-555-5555'
            )
        newschool.put()
        newschool = models.School(
                name = 'Karakura High School',
                state = 'South Carolina',
                zipcode = '55555',
                county = 'Seneca',
                address = 'Example Address',
                phone = '555-555-5555'
            )
        newschool.put()



        self.redirect('/')

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
                self.request.get('name'),
                primary_color = self.request.get('school_color_primary'),
                secondary_color = self.request.get('school_color_secondary'),
                address = self.request.get('school_address'),
                state = self.request.get('school_state'),
                county = self.request.get('school_county'),
                zipcode = self.request.get('school_zipcode'),
                phone = self.request.get('school_phone'),
                admins = [self.user.key]
            )
        school.put()

        school_query = models.School.query().filter(models.School.admins==self.user.key)
        schools = [school.key for school in school_query]
        self.user.school = schools
        self.user.key.get().put()

        self.redirect('/')


class CreateAdminHandler(MyHandler):
    def get(self):
        self.setupUser()
        user_data = self.user_model.create_user('admin@classtrack.com',
            first_name='Admin',
            password_raw='admin',
            last_name='AdminLastName',
            user_type=admin_user,
            children=[],
            verified='false',
            classList=[],
            meetings=[],
            messageThreads=[])
        self.redirect('/')

class ProfileHandler(MyHandler):
    def get(self):
        self.setupUser()
        self.navbarSetup()
        self.render('profile.html')

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
    # webapp2.Route('/documents',DocumentsPageHandler, name='documents'),
    webapp2.Route('/conference',ConferencePageHandler, name='chatroom'),
    webapp2.Route('/conferenceSchedule',ConferenceSchedulerPageHandler, name='chatroomscheduler'),
    webapp2.Route('/addConference',AddConferencePageHandler, name='addConference'),
    webapp2.Route('/delConference',DelConferenceHandler, name='delConference'),
    webapp2.Route('/messaging',ContactTeacherPageHandler, name='messaging'),
    webapp2.Route('/showMessage',ShowMessagePageHandler, name='showmessage'),
    webapp2.Route('/addMessage',AddMessagePageHandler, name='addmessage'),
    webapp2.Route('/classSelect',ClassSelectPageHandler, name='classselect'),
    webapp2.Route('/schoolSetup',SchoolSetupHandler, name='schoolsetup'),
    webapp2.Route('/makeNDB',InitNDBHandler, name='initNDB'),
    webapp2.Route('/addChild', AddChildHandler, name='addChild'),
    webapp2.Route('/addPost', AddPostHandler, name='addPost'),
    webapp2.Route('/childRegistration', ChildRegistrationHandler, name='childRegistration'),
    webapp2.Route('/teacherRegistration', TeacherRegistrationHandler, name='teacherRegistration'),
    webapp2.Route('/profile', ProfileHandler, name='profile'),
    webapp2.Route('/profileEdit', EditProfileHandler, name='profileEdit'),
    webapp2.Route('/classSelect',ClassSelectPageHandler, name='classselect'),
    webapp2.Route('/.*', NotFoundPageHandler, name='notFound'),
    webapp2.Route('/createAdmin', CreateAdminHandler, name='CreateAdmin'),
    # webapp2.Route('/ConferenceMessageChannel', ConferenceMessageChannelHandler, name='conferenceMessageChannel'),
    # webapp2.Route('/_ah/channel/connected/', ChannelConnectionHandler, name='ConnectionHandler'),
    # webapp2.Route('/_ah/channel/disconnected/', ChannelDisconnectionHandler, name='DisconnectionHandler'),
    # webapp2.Route('/testSendMessage', SendMessageHandler, name='SendMessageHandler')
    webapp2.Route('/.*', NotFoundPageHandler)
], debug=True, config=config)
