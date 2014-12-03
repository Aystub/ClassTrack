import time
import webapp2_extras.appengine.auth.models

from google.appengine.ext import ndb

from webapp2_extras import security

class User(webapp2_extras.appengine.auth.models.User):
    meetings = ndb.StringProperty()
    children = ndb.StringProperty(repeated=True)

    def getKey(self):
        return self.key.get()

    def set_password(self, raw_password):
        """Sets the password for the current user

        :param raw_password:
            The raw password which will be hashed and stored
        """
        self.password = security.generate_password_hash(raw_password, length=12)

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

class Student(ndb.Model):
    student_id = ndb.StringProperty()
    full_name = ndb.StringProperty()
    class_list = ndb.StringProperty(repeated=True)
    school_name = ndb.StringProperty()

    def getKey(self):
        return self.key

    def getDict(self):
        """Returns a dictionary representation of parts of this pin."""
        return {'studentID': self.key.id(), 'full_name': self.full_name, 'class_list': self.class_list}

    def remove(self):
        self.key.delete()

class classes(ndb.Model):
	teacher = ndb.StringProperty()
	school = ndb.StringProperty()
	studentList = ndb.StringProperty(repeated=True)
	name = ndb.StringProperty()

	def id(self):
		return self.key.id()

class PrivateMessage(ndb.Model):
    sender = ndb.StringProperty(required=True)
    reciever = ndb.StringProperty(required=True)
    message = ndb.TextProperty()
    time = ndb.DateTimeProperty(auto_now_add=True)

    def id(self):
        return self.key.id()

class Conference(ndb.Model):
    purpose = ndb.StringProperty(required=True)
    participants = ndb.StringProperty(required=True)
    datetime = ndb.DateProperty(required=True)
    created = ndb.DateTimeProperty(auto_now_add=True)
    def id(self):
        return self.key.id()