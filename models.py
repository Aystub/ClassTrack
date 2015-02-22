import time
import webapp2_extras.appengine.auth.models

from google.appengine.ext import ndb

from webapp2_extras import security

class User(webapp2_extras.appengine.auth.models.User):
    first_name = ndb.StringProperty()
    last_name = ndb.StringProperty()
    user_type = ndb.IntegerProperty()
    meetings = ndb.KeyProperty(kind='Conference',repeated=True)
<<<<<<< HEAD
<<<<<<< HEAD
    children = ndb.KeyProperty(kind='User', repeated=True)
    messageThreads = ndb.KeyProperty(kind ='MessageThread', repeated=True)
    classList = ndb.KeyProperty(kind='Classes', repeated=True)
    #school = ndb.KeyProperty(kind="School", repeated=True)
    school = ndb.StringProperty()

    def id(self):
        return self.key.id()
=======
    children = ndb.StringProperty(repeated=True)
    messageThreads = ndb.StringProperty(repeated=True)
    classList = ndb.StringProperty(repeated=True)
>>>>>>> parent of 77e265e... models changes
=======
    children = ndb.StringProperty(repeated=True)
    messageThreads = ndb.StringProperty(repeated=True)
    classList = ndb.StringProperty(repeated=True)
>>>>>>> parent of 77e265e... models changes

    def getKey(self):
        return self.key.get()

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

class School(ndb.Model):
    school_name = ndb.StringProperty(required=True)
    state = ndb.StringProperty(required=True)
    county = ndb.StringProperty(required=True)

    def id(self):
        return self.key.id()

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

class Classes(ndb.Model):
    teacher = ndb.StringProperty()
    school = ndb.StringProperty()
    studentList = ndb.StringProperty(repeated=True)
    name = ndb.StringProperty()

    def id(self):
        return self.key.id()

class PrivateMessage(ndb.Model):
    sender = ndb.StringProperty(required=True)
    messageThread = ndb.StringProperty(required=True)
    message = ndb.TextProperty()
    time = ndb.DateTimeProperty(auto_now_add=True)

    def id(self):
        return self.key.id()

class MessageThread(ndb.Model):
    time = ndb.DateTimeProperty(required=True)
    subject = ndb.StringProperty(required=True)
    users = ndb.StringProperty(repeated=True)
    messageList = ndb.StringProperty(repeated=True)
<<<<<<< HEAD

=======
>>>>>>> parent of 77e265e... models changes

    def id(self):
        return self.key.id()

class Conference(ndb.Model):
    purpose = ndb.StringProperty(required=True)
    participants = ndb.StringProperty(repeated=True)
    datetime = ndb.DateProperty(required=True)
    created = ndb.DateTimeProperty(auto_now_add=True)
    partString = ndb.StringProperty()
    def id(self):
        return self.key.id()
