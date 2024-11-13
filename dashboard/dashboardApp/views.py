from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render
from django.db import connection
import json

''' MAIN PAGE '''
def index(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            road_network_district = data.get('road_network_entry')
            bridge_network_district = data.get('bridge_network_entry')
            print('road_network_district', road_network_district)
            print('bridge_network_district', bridge_network_district)
            if road_network_district:
                # Your database query and data processing
                if road_network_district == 'select_all':
                    query_str = ''
                    query_columns = '''
                        gid, shape_leng, 
                            ST_AsGeoJSON(ST_Transform(geom, 4326)) AS geom, bt_width_m, shoulder_t, shoulder_w, 
                            shoulder_1, year_built, pavement_c, no_of_lane, traffic_lo, strategic, 
                            feeding_po, condition_, length_of_, condition1, trees_alon, basic_amen, 
                            administra, carriagewa, median_typ, last_repai, type_of_la, road_sign_, 
                            name, district, bt_width, road_class, pavement_t, row_m
                    '''
                    table_name = 'kpk_c&w_road_network_2'
                elif road_network_district == 'select_all_pkha':
                    query_columns = '''gid, name, popupinfo, shape_leng, ST_AsGeoJSON(ST_Transform(geom, 4326))'''
                    query_str = ''
                    table_name = 'kpk_pkha_road_network'
                else:
                    query_str = f"WHERE district = '{road_network_district}'"
                    query_columns = '''
                        gid, shape_leng, 
                            ST_AsGeoJSON(ST_Transform(geom, 4326)) AS geom, bt_width_m, shoulder_t, shoulder_w, 
                            shoulder_1, year_built, pavement_c, no_of_lane, traffic_lo, strategic, 
                            feeding_po, condition_, length_of_, condition1, trees_alon, basic_amen, 
                            administra, carriagewa, median_typ, last_repai, type_of_la, road_sign_, 
                            name, district, bt_width, road_class, pavement_t, row_m
                    '''
                    table_name = 'kpk_c&w_road_network_2'
                with connection.cursor() as cursor:
                    sql_query = f"""
                        SELECT {query_columns} FROM public."{table_name}"
                        {query_str}
                    """
                    cursor.execute(sql_query)
                    rows = cursor.fetchall()  
                    if road_network_district == 'select_all_pkha':
                        data = [
                        {
                            "gid": row[0],
                            "name": row[1],
                            "popupinfo": row[2],
                            "shape_leng": row[3],
                            "geom": row[4]  # GeoJSON data for geometry
                        }
                        for row in rows
                        ]
                    else:
                        data = [
                        {
                            "gid": row[0],
                            "shape_leng": row[1],
                            "geom": row[2],  # GeoJSON data for geometry
                            "bt_width_m": row[3],
                            "shoulder_t": row[4],
                            "shoulder_w": row[5],
                            "shoulder_1": row[6],
                            "year_built": row[7],
                            "pavement_c": row[8],
                            "no_of_lane": row[9],
                            "traffic_lo": row[10],
                            "strategic": row[11],
                            "feeding_po": row[12],
                            "condition_": row[13],
                            "length_of_": row[14],
                            "condition1": row[15],
                            "trees_alon": row[16],
                            "basic_amen": row[17],
                            "administra": row[18],
                            "carriagewa": row[19],
                            "median_typ": row[20],
                            "last_repai": row[21],
                            "type_of_la": row[22],
                            "road_sign_": row[23],
                            "name": row[24],
                            "district": row[25],
                            "bt_width": row[26],
                            "road_class": row[27],
                            "pavement_t": row[28],
                            "row_m": row[29]
                        }
                        for row in rows
                        ]
                return JsonResponse(data, safe=False)
            elif bridge_network_district:
                if bridge_network_district == 'select_all':
                    query_str = ''
                    query_columns = '''
                        gid, bridge_name, 
                        ST_AsGeoJSON(geom) AS geom, 
                        district
                    '''
                    table_name = 'kpk_c&w_pkha_bridges_by_districts'
                else:
                    query_str = f"WHERE district = '{bridge_network_district}'"
                    query_columns = '''
                        gid, bridge_name, 
                        ST_AsGeoJSON(geom) AS geom, 
                        district
                    '''
                    table_name = 'kpk_c&w_pkha_bridges_by_districts'

                with connection.cursor() as cursor:
                    sql_query = f"""
                        SELECT {query_columns} FROM public."{table_name}"
                        {query_str}
                    """
                    cursor.execute(sql_query)
                    rows = cursor.fetchall()

                    data = [
                        {
                            "gid": row[0],
                            "bridge_name": row[1],
                            "geom": row[2],  # GeoJSON data for geometry
                            "district": row[3],
                        }
                        for row in rows
                    ]
                return JsonResponse(data, safe=False)
            else:
                return JsonResponse({"error": "No district provided"}, status=400)
        except json.JSONDecodeError as e:
            return JsonResponse({"error": "Invalid JSON format", "details": str(e)}, status=400)
    return render(request, 'home.html')

''' VIEWING INDIVIDUAL ROAD '''
def view_individual_road(request, road_name, is_pkha):
    is_pkha = bool(is_pkha)
    try:
        if is_pkha:
            table_name = 'kpk_pkha_road_network'
        else:
            table_name = 'kpk_c&w_road_network_2'
        with connection.cursor() as cursor:
            sql_query = f"""
                SELECT ST_AsGeoJSON(ST_Transform(geom, 4326)) AS geom, gid, name
                FROM public."{table_name}" WHERE name = '{road_name}'
            """
            cursor.execute(sql_query)
            row = cursor.fetchone()
        return JsonResponse({
            "geom": row[0],
            "gid": row[1],
            "name": row[2],
        })
    except:
        return JsonResponse({'error': 'Road not found'}, status=404)

''' VIEWING INDIVIDUAL BRIDGE '''
def view_individual_bridge(request, bridge_name):
    try:
        table_name = 'kpk_c&w_pkha_bridges_by_districts'
        with connection.cursor() as cursor:
            sql_query = f"""
                SELECT ST_AsGeoJSON(geom) AS geom, gid, bridge_name
                FROM public."{table_name}" WHERE bridge_name = '{bridge_name}'
            """
            cursor.execute(sql_query)
            row = cursor.fetchone()
        return JsonResponse({
            "geom": row[0],
            "gid": row[1],
            "bridge_name": row[2],
        })
    except:
        return JsonResponse({'error': 'Road not found'}, status=404)

''' POPULATING ATTRIBUTE TABLE FOR INDIVIDUAL ROAD '''
def get_road_data(request, road_id, is_pkha):
    is_pkha = bool(is_pkha)
    if is_pkha:
        table_name = 'kpk_pkha_road_network'
    else:
        table_name = 'kpk_c&w_road_network_2'

    with connection.cursor() as cursor:
        # Retrieve column names and exclude 'geom'
        cursor.execute(f'''SELECT column_name FROM information_schema.columns WHERE table_name = '{table_name}' ''')
        # I am ommiting name_1, path, fid_1, last_rep_2, last_rep_1, year_bui_2, year_bui_1, gid BECAUSE for now there is no data in them
        columns = [
            row[0] for row in cursor.fetchall() 
            if row[0] != 'geom' and row[0] not in ['gid']
        ]
        
        # Create a SQL query string with selected columns
        column_names = ', '.join(columns)
        cursor.execute(f'''SELECT {column_names} FROM "{table_name}" WHERE gid = {road_id}''')
        
        # Fetch data and map to column names
        data = cursor.fetchone()
        road_data = dict(zip(columns, data)) if data else {}

    return JsonResponse(road_data)

''' POPULATING ATTRIBUTE TABLE FOR INDIVIDUAL BRIDGE '''
def get_bridge_data(request, bridge_id):
    table_name = 'kpk_c&w_pkha_bridges_by_districts'
    with connection.cursor() as cursor:
        cursor.execute(f'''SELECT column_name FROM information_schema.columns WHERE table_name = '{table_name}' ''')
        columns = [
            row[0] for row in cursor.fetchall() 
            if row[0] != 'geom' and row[0] not in ['gid']
        ]
        
        # Create a SQL query string with selected columns
        column_names = ', '.join(columns)
        print(column_names)
        cursor.execute(f'''SELECT {column_names} FROM "{table_name}" WHERE gid = {bridge_id}''')
        
        # Fetch data and map to column names
        data = cursor.fetchone()
        bridge_data = dict(zip(columns, data)) if data else {}

    return JsonResponse(bridge_data)

''' FILTERING DATA BASED ON DISTRICTS AND DIVISIONS '''
def get_admin_boundaries(request, level):
    if level == 0:
        name = 'name_0'
    elif level == 1:
        name = 'name_1'
    elif level == 2:
        name = 'name_2'
    elif level == 3:
        name = 'name_3'
    
    # Check for 'filter' query parameter
    filter_name = request.GET.get('filter')
    table_name = f'pak_adm{level}'
    with connection.cursor() as cursor:
        # Base SQL query
        sql_query = f"SELECT gid, {name}, ST_AsGeoJSON(geom) FROM {table_name}"
        
        if filter_name:
            division = request.GET.get('division')
            district = request.GET.get('district')
            if division:
                tName = 'pak_adm2'
            elif district:
                tName = 'pak_adm3'
            else:
                tName = 'pak_adm1'    
            sql_query = f"SELECT gid, name_1, ST_AsGeoJSON(geom) FROM {tName}"
            # Add WHERE clause if filter_name is provided
            sql_query += f" WHERE {tName}.name_1 IN ({filter_name})"  # Prepare for safe parameter insertion
            cursor.execute(sql_query)
        else:
            cursor.execute(sql_query)

        data = [
            {"id": row[0], "name": row[1], "geometry": row[2]}
            for row in cursor.fetchall()
        ]
    
    return JsonResponse(data, safe=False)

''' POPULATING ATTRIBUTE TABLE FOR PAKISTAN'S REGIONS '''
def get_region_data(request, region_id, level):
    table_name = f'pak_adm{level}'

    with connection.cursor() as cursor:
        # Retrieve column names and exclude 'geom'
        cursor.execute(f"SELECT column_name FROM information_schema.columns WHERE table_name = '{table_name}'")
        columns = [row[0] for row in cursor.fetchall() if row[0] != 'geom']
        
        # Create a SQL query string with selected columns
        column_names = ', '.join(columns)
        cursor.execute(f"SELECT {column_names} FROM {table_name} WHERE gid = {region_id}")
        
        # Fetch data and map to column names
        data = cursor.fetchone()
        region_data = dict(zip(columns, data)) if data else {}

    return JsonResponse(region_data)
