import time
import webapp2_extras.appengine.auth.models

from google.appengine.ext import ndb

from webapp2_extras import security

admin_user = 0   #user is a admin
teacher_user = 1 #user is a teacher
parent_user = 2  #user is a parent
student_user = 3 #user is a student

class User(webapp2_extras.appengine.auth.models.User):
    first_name = ndb.StringProperty()
    last_name = ndb.StringProperty()
    user_type = ndb.IntegerProperty()
    meetings = ndb.KeyProperty(kind='Conference', repeated=True)
    invited = ndb.KeyProperty(kind='Conference', repeated=True)
    family = ndb.KeyProperty(kind='User',repeated=True)
    message_threads = ndb.KeyProperty(kind='MessageThread',repeated=True)
    messages = ndb.KeyProperty(kind='MessageThread',repeated=True)
    course_list = ndb.KeyProperty(kind='Course',repeated=True)
    hasCourses = ndb.ComputedProperty(lambda self: len(self.course_list) != 0)
    school = ndb.KeyProperty(kind='School',repeated=True)
    
    def takingCourse(courseID):
        for course in self.course_list:
            if course == courseID:
                return True
        return False

    def id(self):
        return self.key.id()

    def getKey(self):
        return self.key.get()

    def __unicode__(self):
        return unicode(self.first_name)

    def set_password(self, raw_password):
        """Sets the password for the current user
        :param raw_password:
            The raw password which will be hashed and stored
        """
        self.password = security.generate_password_hash(raw_password, length=12)

    def get_user_type(self):
        return self.user_type

    @classmethod
    def get_by_auth_token(cls, user_id, token, subject='auth'):
        """Returns a user object based on a user ID and token.
        :param user_id:
            The user_id of the requesting user.
        :param token:
            The token string to be verified.
        :returns:
            A tuple ``(User, timestamp)``, with a user object and
            the token timestamp, or ``(None, None)`` if both were not found.
        """
        token_key = cls.token_model.get_key(user_id, subject, token)
        user_key = ndb.Key(cls, user_id)
        # Use get_multi() to save a RPC call.
        valid_token, user = ndb.get_multi([token_key, user_key])
        if valid_token and user:
            timestamp = int(time.mktime(valid_token.created.timetuple()))
            return user, timestamp

        return None, None

    def set_password(self, raw_password):
        """Sets the password for the current user
        :param raw_password:
            The raw password which will be hashed and stored
        """
        self.password = security.generate_password_hash(raw_password, length=12)

class School(ndb.Model):
    name = ndb.StringProperty(required=True)
    address = ndb.StringProperty(required=True)
    phone = ndb.StringProperty(required=True)
    state = ndb.StringProperty(required=True)
    county = ndb.StringProperty(required=True)
    zipcode = ndb.StringProperty(required=True)
    primary_color = ndb.StringProperty()
    secondary_color = ndb.StringProperty()
    
    #Why do we need these?
    students = ndb.KeyProperty(kind='User',repeated=True)
    teachers = ndb.KeyProperty(kind='User',repeated=True)
    admins = ndb.KeyProperty(kind='User',repeated=True)
    classes = ndb.KeyProperty(kind='Course',repeated=True)

    def id(self):
        return self.key.id()

    def getKey(self):
        return self.key.get()

    @staticmethod #just like a Java static method
    def getSchool(num):
        """Returns the pin with the given num (a String), or None if there is no such num."""
        try:
            theSchool = School.get_by_id(long(num))
            return theSchool
        except ValueError:
            return None

    def getDict(self):
        """Returns a dictionary representation of parts of this pin."""
        return {'schoolID': self.id(), 'school_name': self.school_name}

    def remove(self):
        self.key.delete()

class Course(ndb.Model):
    school = ndb.KeyProperty(kind='School',required=True)
    name = ndb.StringProperty(required=True)
    student_list = ndb.KeyProperty(kind='User',repeated=True)
    teacher = ndb.KeyProperty(kind='User',repeated=True)

    def id(self):
        return self.key.id()

    @classmethod
    def key(self):
        return self.key

    @classmethod
    def custom_to_dict(self):
        return {
            school: self.school,
            name: self.name,
            student_list: [student.urlsafe() for student in self.student_list],
            teacher: [teach.urlsafe() for teach in self.teacher]
        }

class PrivateMessage(ndb.Model):
    sender = ndb.KeyProperty(required=True)
    message = ndb.TextProperty()
    time = ndb.DateTimeProperty(auto_now_add=True)

    def id(self):
        return self.key.id()

class MessageThread(ndb.Model):
    time = ndb.DateTimeProperty(required=True,indexed=True)
    subject = ndb.StringProperty(required=True)
    users = ndb.KeyProperty(kind='User',repeated=True)
    messageList = ndb.KeyProperty(kind='PrivateMessage',repeated=True)

    def id(self):
        return self.key.id()


#############Posts - TBD##################
class NFPost(ndb.Model):
    schoolID = ndb.IntegerProperty(default=0)
    classID = ndb.IntegerProperty(default=0)
    typeID = ndb.IntegerProperty(default=0)
    caption = ndb.TextProperty()
    owner = ndb.StringProperty(required=True)
    img = ndb.BlobProperty(default=None)
    time = ndb.DateTimeProperty(auto_now_add=True)

    def id(self):
        return self.key.id()

    @staticmethod #just like a Java static method
    def getCard(num):
        """Returns the pin with the given num (a String), or None if there is no such num."""
        try:
            thePost = NFPost.get_by_id(long(num))
            return thePost
        except ValueError:
            return None

    def getDict(self):
        """Returns a dictionary representation of parts of this pin."""
        return {'postID': self.id(), 'caption': self.caption, 'owner': self.owner, 'time': self.time}

    def remove(self):
        self.key.delete()

class Conference(ndb.Model):
    purpose = ndb.StringProperty(required=True)
    participants = ndb.StringProperty(repeated=True)
    datetime = ndb.DateTimeProperty(required=True)
    created = ndb.DateTimeProperty(auto_now_add=True)
    currentLoggedInUsers = ndb.StringProperty(repeated=True)
    participant_ids = ndb.IntegerProperty(repeated=True)
    accepted = ndb.BooleanProperty(default=False)
    names_list = ndb.StringProperty()

    def id(self):
        return self.key.id()

    @classmethod
    def getKey(self):
        return self.key
