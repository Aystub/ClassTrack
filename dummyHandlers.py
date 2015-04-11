import webapp2
import models
import main

#CONSTANTS for user type
admin_user = 0   #user is a admin
teacher_user = 1 #user is a teacher
parent_user = 2  #user is a parent
student_user = 3 #user is a student
#END CONSTANTS

# Dummy data handlers
class MakeDummyChildrenHandler(webapp2.RequestHandler):
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

class InitNDBHandler(webapp2.RequestHandler):
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
        schoolList = []
        schoolList.append(Seneca)

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
        user_data = models.User(
            auth_ids=["jgoodmen@cse.sc.edu"],
            first_name="John",
            password_raw="password",
            last_name="Goodmen",
            user_type=teacher_user,
            family=[],
            verified=True,
            class_list=[mathclass],
            meetings=[],
            messageThreads=[],
            school = schoolList
        )

        user_key = user_data.put()



        #Link Teacher
        Seneca.get().teachers.append(user_key)
        mathclass.get().teacher.append(user_key)

        Seneca = Seneca.get().put()
        mathclass = mathclass.get().put()


        #Add Students and Add to List
        studentList = []

        new_child = models.User(
            auth_ids = ["1227"],
            first_name = 'Devin',
            last_name = 'Crawford',
            user_type = 3,
            school = schoolList,
            course_list = [mathclass]
        )

        studentList.append(new_child.put())

        new_child = models.User(
            auth_ids = ["1228"],
            first_name = 'Micheal',
            last_name = 'Campbell',
            user_type = 3,
            school = schoolList,
            course_list = [mathclass]

        )
        studentList.append(new_child.put())

        new_child = models.User(
            auth_ids = ["1229"],
            first_name = 'Sam',
            last_name = 'Ballard',
            user_type = 3,
            school = schoolList,
            course_list = [mathclass],

        )
        studentList.append(new_child.put())

        new_child = models.User(
            auth_ids = ["1230"],
            first_name = 'Rodolfo',
            last_name = 'Frazier',
            user_type = 3,
            school = schoolList,
            course_list = [mathclass]

        )
        studentList.append(new_child.put())

        new_child = models.User(
            auth_ids = ["1231"],
            first_name = 'Edith',
            last_name = 'Wolfe',
            user_type = 3,
            school = schoolList,
            course_list = [mathclass]

        )
        studentList.append(new_child.put())

        new_child = models.User(
            auth_ids = ["1232"],
            first_name = 'Stuart',
            last_name = 'Neal',
            user_type = 3,
            school = schoolList,
            course_list = [mathclass]

        )
        studentList.append(new_child.put())

        new_child = models.User(
            auth_ids = ["1233"],
            first_name = 'Darlene',
            last_name = 'Osborne',
            user_type = 3,
            school = schoolList,
            course_list = [mathclass]

        )

        studentList.append(new_child.put())

        new_child = models.User(
            auth_ids = ["1234"],
            first_name = 'Taylor',
            last_name = 'Griffith',
            user_type = 3,
            school = schoolList,
            course_list = [mathclass]

        )
        studentList.append(new_child.put())

        #Link Students
        Seneca.get().students = studentList
        mathclass.get().student_list = studentList

        Seneca.get().put()
        mathclass.get().put()

        self.redirect('/')