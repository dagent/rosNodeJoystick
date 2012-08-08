#!/usr/bin/env python

''' Take values for velocity/rotation from stdin to control the turtle
'''


import roslib; roslib.load_manifest('turtlesim')
from turtlesim.msg import Velocity
import rospy
import signal, sys, getopt, json

# some global config variables
useYaml = False # Interpret two values by default
debugFlag = False

# -h help/usage information and exit
progname = sys.argv[0]
def usage():
    message="""
        {progname} [-y|--yaml]

        Read two numbers from stdin as the Velocity values for turtlesim
        (linear,angular).

        -y|--yaml options cause stdin to be interpreted as YAML:
            Example: {"linear": 1.1, "angular": 0.4}

    """
    print message
    sys.exit(0)

# Handle Ctl-C
def signal_handler(signal, frame):
    pe('\nExciting on Ctrl+C')
    sys.exit(0)
signal.signal(signal.SIGINT, signal_handler)

# Error message handler to STDERR
def pe(*text):
    if debugFlag:
        print >>sys.stderr, "*** ", ' '.join(text)

# Get a line from stdin, and parse as 
def getLine():
    line = raw_input().strip()
    linear_val = 0.0
    angular_val = 0.0
    if useYaml:
        try:
            decoded = json.loads(line)
            linear_val = float(decoded["linear"])
            angular_val = float(decoded["angular"])
        except:
            pe(line, ": YAML/JSON interpret error")
    else:
        try:
            decoded = line.split()
            linear_val = float(decoded[0])
            angular_val = float(decoded[1])
        except:
            pe(line, ": Parsing error")

    return [linear_val, angular_val]


def talker():
    pub = rospy.Publisher('turtle1/command_velocity', Velocity)
    rospy.init_node('turtle_stdin')
    while not rospy.is_shutdown():
        str = getLine()
        #rospy.loginfo(str)
        pub.publish(Velocity(str[0], str[1]))

if __name__ == '__main__':

    # Handle arguments
    for arg in sys.argv[1:]:
        if arg in ("-y", "--yaml"):
            useYaml = True
        if arg in ("-d", "--debug"):
            debugFlag = True
        else:
            usage()

    try:
        talker()
    except rospy.ROSInterruptException: pass
