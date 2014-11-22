import time
import webapp2_extras.appengine.auth.models

from google.appengine.ext import ndb

from webapp2_extras import security

class User(webapp2_extras.appengine.auth.models.User):
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

class Post(ndb.Model):
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
            theCard = Card.get_by_id(long(num))
            return theCard
        except ValueError:
            return None

    def getDict(self):
        """Returns a dictionary representation of parts of this pin."""
        return {'cardID': self.id(), 'caption': self.caption, 'owner': self.owner, 'time': self.time}

    def remove(self):
        self.key.delete()
