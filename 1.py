from pycalphad import Database

db1 = Database(r'E:\zuhui\testbox\steel1.TDB')
all_elements1 = db1.elements
db2 = Database(r'E:\zuhui\testbox\steel7.TDB')
all_elements2 = db1.elements
print(all_elements1)
print(all_elements2)

