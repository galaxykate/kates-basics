### Goals

have a set of inputs of arrays-of-arrays than can be fused into a single data format

### Log

----
Dec 16

----
Dec 15

Give every tracker point a cannonical position
easily convert any tracker point into a screenrelative or boudning box relative point
note - whoops, didnt do any of that in favor of another bad-idea refactor

----
Dec 6

Switched the way it works to the fusion being a concatenation of all the slices
Goal before train: store and see history


----
Nov 30
Understand how data flows through the system
We need a way to overlay the tracking data, to display something else
So its best to have a second data structure that's the copy of the hands

----
Nov 29
Caffeinated at sbux
The hands are recording info, but not playing it back - todo, figure out why?


----

Nov 26
Todo: 
reactivate hand tracking
playback and record hands
sub-slices!

----

Nov 24
timeline now scrubs correctly (drag tip - track the drag offset and original start, and move original start)
todo
✅ clamp active
✅ save/load data

------
Nov 22
snow!
Make the timeline follow the current frame 


When recording/playing (not paused) set the frame to either loop, or go around

------
Nov 19
started with playback "working" but all data looks the same? (Checked - yep, it was not incrementing the time)
visualize the past frames ✅
todo: 
Play(space) to restart playback
Loop current window
Record and replay hand tracking

folding the DataRecorder class into just the Vue component... If I do my job right, it just does UI and the Slice handles a lot of the rest

------
Nov 18

finished refactor

------
Nov 17

slice to array
save array slices, 
play them back

------

Nov 16 

Get the visualizations of past values again
whoops refactored everything into
Stream: data container plus id and any computed values like length/dim
DataSlice: take slices and turn them into arrays, and vice versa

-----------------------

Nov 11 hanging w jonas
todo
toggle between record and play

----

Nov 10
Does it make sense to have an index with every recording?

------

Nov 9
recorder vs recording
Got playback!


----

Nov8
save data history
playback data history
----
Nov7 

Review code
goal: 
✅ see data update by noise
✅ data to single array


